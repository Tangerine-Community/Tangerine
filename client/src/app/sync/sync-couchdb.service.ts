import { LocationConfig } from './../device/classes/device.class';
import {HttpClient, HttpResponse} from '@angular/common/http';
import { ReplicationStatus } from './classes/replication-status.class';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { UserDatabase } from './../shared/_classes/user-database.class';
import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb'
import {Subject} from 'rxjs';
import {VariableService} from '../shared/_services/variable.service';
import {AppConfigService} from '../shared/_services/app-config.service';
import { AppContext } from '../app-context.enum';
import {CaseDefinition} from "../case/classes/case-definition.class";
import {CaseDefinitionsService} from "../case/services/case-definitions.service";
import {CaseService} from "../case/services/case.service";
import {TangyFormService} from "../tangy-forms/tangy-form.service";
import {ConflictService} from "./services/conflict.service";

export interface LocationQuery {
  level:string
  id:string
}

export class SyncCouchdbDetails {
  serverUrl:string
  groupId:string
  deviceId:string
  deviceToken:string
  formInfos:Array<FormInfo> = []
  locationQueries:Array<LocationQuery> = []
  deviceSyncLocations:Array<LocationConfig>
}

@Injectable({
  providedIn: 'root'
})
export class SyncCouchdbService {

  public readonly syncMessage$: Subject<any> = new Subject();
  batchSize = 200
  initialBatchSize = 1000
  writeBatchSize = 50
  streamBatchSize = 25
  pullSyncOptions;
  pushSyncOptions;
  fullSync: string;
  
  constructor(
    private http: HttpClient,
    private variableService: VariableService,
    private appConfigService: AppConfigService,
    private caseDefinitionsService: CaseDefinitionsService,
    private caseService: CaseService,
    private tangyFormService: TangyFormService,
    private conflictService: ConflictService
  ) { }

  /**
   * Note that if you run this with no forms configured to CouchDB sync,
   * that will result in no filter query and everything will be synced. Use carefully.
   * @param userDb
   * @param syncDetails
   * @param caseDefinitions - null if not testing.
   */
  async sync(
    userDb:UserDatabase,
    syncDetails:SyncCouchdbDetails,
    caseDefinitions:CaseDefinition[] = null,
    isFirstSync = false,
    fullSync:string
  ): Promise<ReplicationStatus> {
    // Prepare config.
    const appConfig = await this.appConfigService.getAppConfig()
    this.batchSize = appConfig.batchSize || this.batchSize
    this.initialBatchSize = appConfig.initialBatchSize || this.initialBatchSize
    this.writeBatchSize = appConfig.writeBatchSize || this.writeBatchSize
    let batchSize = fullSync === 'pull' 
      ? this.initialBatchSize
      : this.batchSize
    // Create sync session and instantiate remote database connection.
    const syncSessionUrl = await this.http.get(`${syncDetails.serverUrl}sync-session/start/${syncDetails.groupId}/${syncDetails.deviceId}/${syncDetails.deviceToken}`, {responseType:'text'}).toPromise()
    const remoteDb = new PouchDB(syncSessionUrl)

    // Push.
    const pushReplicationStatus = await this.push(userDb, remoteDb, appConfig, syncDetails);
    if (!pushReplicationStatus.pushError) {
      await this.variableService.set('sync-push-last_seq', pushReplicationStatus.info.last_seq)
    } else {
      // Bail so we don't end up pulling and having to try to push those pulled changes!
      return 
    }

    // Pull.
    let pullReplicationStatus
    try {
      pullReplicationStatus = await this.pull(userDb, remoteDb, appConfig, syncDetails, batchSize);
      if (!pullReplicationStatus.pullError) {
        await this.variableService.set('sync-pull-last_seq', pullReplicationStatus.info.last_seq)
      } else {
        console.warn(`sync-pull-last_seq not set because there was no status.info.last_seq`)
      }
    } catch (e) {
      console.error(e)
    }

    // Whatever we pulled, even if there was an error, we don't need to push so set last push sequence again.
    const localSequenceAfterPull = (await userDb.changes({descending: true, limit: 1})).last_seq
    await this.variableService.set('sync-push-last_seq', localSequenceAfterPull)

    // All done.
    let replicationStatus = {...pullReplicationStatus, ...pushReplicationStatus}
    return replicationStatus
  }

   _push = (userDb, remoteDb, syncOptions) => {
    return new Promise( (resolve, reject) => {
      const direction = 'push'
      const progress = {
        'direction': direction,
        'remaining': syncOptions.remaining
      }
      this.syncMessage$.next(progress)
      userDb.db['replicate'].to(remoteDb, syncOptions).on('complete', async (info) => {
        const status = <ReplicationStatus>{
          pushed: info.docs_written,
          info: info,
          direction: direction
        }
        if (info.errors && info.errors.length > 0) {
          status.pushError = info.errors.join('; ')
          reject(status)
        } else {
          resolve(status)
        }
      }).on('change', async (info) => {
        const pushed = syncOptions.pushed + info.docs_written
        const progress = {
          'docs_read': info.docs_read,
          'docs_written': info.docs_written,
          'doc_write_failures': info.doc_write_failures,
          'pending': info.pending,
          'direction': direction,
          'last_seq': info.last_seq,
          'pushed': pushed
        };
        this.syncMessage$.next(progress);
      }).on('active', function (info) {
        if (info) {
          console.log('Push replication is active. Info: ' + JSON.stringify(info));
        } else {
          console.log('Push replication is active.');
        }
      }).on('error', function (error) {
        console.error(error)
        const status = <ReplicationStatus>{
          pushError: "_push failed. error: " + error
        }
        reject(status);
      });
    })
  }
  
  async push(userDb, remoteDb, appConfig, syncDetails): Promise<ReplicationStatus> {
    // Get the sequences we'll be starting with.
    let push_last_seq = await this.variableService.get('sync-push-last_seq')

    if (typeof push_last_seq === 'undefined') {
      push_last_seq = 0;
    }
    if (this.fullSync && this.fullSync === 'push') {
      push_last_seq = 0;
    }

    let progress = {
      'direction': 'push',
      'message': 'About to push any new data to the server.'
    }
    
    this.syncMessage$.next(progress)

    let status = <ReplicationStatus>{
      pushed: 0,
      info: '',
      remaining: 0,
      direction: 'push'
    };
    
    let failureDetected = false
    let pushed = 0
    let syncOptions = {
      "since":push_last_seq,
      "batch_size": this.batchSize,
      "batches_limit": 1,
      "remaining": 100,
      "pushed": pushed,
      "checkpoint": 'source',
      "selector": {
        "$not": {
          "_id": {
            "$regex": "^_design"
          }
        }
      }
    }

    syncOptions = this.pushSyncOptions ? this.pushSyncOptions : syncOptions

    try {
      status = <ReplicationStatus>await this._push(userDb, remoteDb, syncOptions);
      if (typeof status.pushed !== 'undefined') {
        pushed = pushed + status.pushed
        status.pushed = pushed
      } else {
        status.pushed = pushed
      }
      this.syncMessage$.next(status)
    } catch (statusWithError) {
      status = {
        ...status,
        ...statusWithError
      }
      failureDetected = true
    }
    
    status.initialPushLastSeq = push_last_seq
    status.currentPushLastSeq = status.info.last_seq

    if (failureDetected) {
      const errorMessageDialog = window['t']('Please re-run the Sync process - it was terminated due to an error. Error: ')
      const errorMessage = errorMessageDialog + status.pushError
      status.error = errorMessage
      console.error(status)
      this.syncMessage$.next(status)
    } else {
    }
    return status;
  }

  _pull = (userDb, remoteDb, syncOptions):Promise<ReplicationStatus> => {
    return new Promise( (resolve, reject) => {
      let status = <ReplicationStatus>{
        pulled: 0,
        pullConflicts: [],
        info: '',
        direction: ''
      }
      const direction = 'pull'
      const progress = {
        'direction': direction,
        'message': "Checking the server for updates."
      }
      this.syncMessage$.next(progress)
      try {
        userDb.db['replicate'].from(remoteDb, syncOptions).on('complete', async (info) => {
          // console.log("info.last_seq: " + info.last_seq)
          const conflictsQuery = await userDb.query('sync-conflicts')
          status = <ReplicationStatus>{
            pulled: info.docs_written,
            pullConflicts: conflictsQuery.rows.map(row => row.id),
            info: info,
            direction: direction
          }
          // TODO: Should we always resolve or if there is an errors property in the info doc should we reject?
          // If that is the case - we may need to make sure the sync-pull-last-seq is not set.
          resolve(status)
        }).on('change', async (info) => {
          const pulled = syncOptions.pulled + info.docs_written
          const progress = {
            'docs_read': info.docs_read,
            'docs_written': info.docs_written,
            'doc_write_failures': info.doc_write_failures,
            'pending': info.pending,
            'direction': 'pull',
            'last_seq': info.last_seq,
            'pulled': pulled
          }
          await this.variableService.set('sync-pull-last_seq', info.last_seq)
          this.syncMessage$.next(progress)
        }).on('error', function (error) {
          if (!status) {
            // We need to create an empty status to return so that the code that receives the reject can attach the error.
            status = <ReplicationStatus>{
              direction: direction
            }
          }
          let errorMessage = "_pull failed. error: " + error
          console.log(errorMessage)
          reject(errorMessage)
        });
      } catch (e) {
        console.log("Error replicating: " + e)
      }
    })
  }

  async pull(userDb, remoteDb, appConfig, syncDetails, batchSize): Promise<ReplicationStatus> {
    let status = <ReplicationStatus>{
      pulled: 0,
      pullConflicts: [],
      info: '',
      remaining: 0,
      direction: 'pull' 
    };
    let pull_last_seq = await this.variableService.get('sync-pull-last_seq')
    if (typeof pull_last_seq === 'undefined') {
      pull_last_seq = 0;
    }
    if (this.fullSync && this.fullSync === 'pull') {
      pull_last_seq = 0;
    }
    const pullSelector = this.getPullSelector(syncDetails);
    let progress = {
      'direction': 'pull',
      'message': 'Querying the remote server.'
    }
    this.syncMessage$.next(progress)
    
    progress = {
      'direction': 'pull',
      'message': 'Received data from remote server.'
    }
    this.syncMessage$.next(progress)
    let batchFailureDetected = false
    let batchError;
    let pulled = 0
    
    /**
     * The sync option batches_limit is set to 1 in order to reduce the memory load on the tablet. 
     * From the pouchdb API doc:      
     * "Number of batches to process at a time. Defaults to 10. This (along wtih batch_size) controls how many docs 
     * are kept in memory at a time, so the maximum docs in memory at once would equal batch_size × batches_limit."
     */
    let syncOptions = {
      "since": pull_last_seq,
      "batch_size": batchSize,
      "write_batch_size": this.writeBatchSize,
      "batches_limit": 1,
      "pulled": pulled,
      "selector": pullSelector,
      "checkpoint": 'target'
    }
    
    syncOptions = this.pullSyncOptions ? this.pullSyncOptions : syncOptions
    
    try {
      status = <ReplicationStatus>await this._pull(userDb, remoteDb, syncOptions);
      if (typeof status.pulled !== 'undefined') {
        pulled = pulled + status.pulled
        status.pulled = pulled
      } else {
        status.pulled = pulled
      }
      this.syncMessage$.next(status)
    } catch (e) {
      console.log("Error: " + e)
      batchFailureDetected = true
      batchError = e
    }
    
    status.initialPullLastSeq = pull_last_seq
    status.currentPushLastSeq = status.info.last_seq
    status.batchSize = batchSize

    if (batchFailureDetected) {
      // don't set last_seq and prompt to re-run
      const errorMessageDialog = window['t']('Please re-run the Sync process - it was terminated due to an error. Error: ')
      const errorMessage = errorMessageDialog + batchError
      console.log(errorMessage)
      status.pullError = errorMessage
      this.syncMessage$.next(status)
    }
    return status;
  }

  getPullSelector(syncDetails) {
    const pullSelector = {
      "$or": [
        ...syncDetails.formInfos.reduce(($or, formInfo) => {
          if (formInfo.couchdbSyncSettings && formInfo.couchdbSyncSettings.enabled && formInfo.couchdbSyncSettings.pull) {
            $or = [
              ...$or,
              ...syncDetails.deviceSyncLocations.length > 0 && formInfo.couchdbSyncSettings.filterByLocation
                ? syncDetails.deviceSyncLocations.map(locationConfig => {
                  // Get last value, that's the focused sync point.
                  let location = locationConfig.value.slice(-1).pop()
                  return {
                    "form.id": formInfo.id,
                    [`location.${location.level}`]: location.value
                  }
                })
                : [
                  {
                    "form.id": formInfo.id
                  }
                ]
            ]
          }
          return $or
        }, []),
        ...syncDetails.deviceSyncLocations.length > 0
          ? syncDetails.deviceSyncLocations.map(locationConfig => {
            // Get last value, that's the focused sync point.
            let location = locationConfig.value.slice(-1).pop()
            return {
              "type": "issue",
              [`location.${location.level}`]: location.value,
              "resolveOnAppContext": AppContext.Client
            }
          })
          : [
            {
              "resolveOnAppContext": AppContext.Client,
              "type": "issue"
            }
          ]
      ]
    }
    return pullSelector;
  }
    
}
