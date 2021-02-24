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
    const appConfig = await this.appConfigService.getAppConfig()
    if (appConfig.batchSize) {
      this.batchSize = appConfig.batchSize
      console.log("this.batchSize: " + this.batchSize)
    }
    if (appConfig.initialBatchSize) {
      this.initialBatchSize = appConfig.initialBatchSize
      console.log("this.initialBatchSize: " + this.initialBatchSize)
    }
    if (appConfig.writeBatchSize) {
      this.writeBatchSize = appConfig.writeBatchSize
      console.log("this.writeBatchSize: " + this.writeBatchSize)
    }
    let batchSize = this.batchSize
    if (fullSync) {
      this.fullSync = fullSync
      batchSize = this.initialBatchSize
    }
    const syncSessionUrl = await this.http.get(`${syncDetails.serverUrl}sync-session/start/${syncDetails.groupId}/${syncDetails.deviceId}/${syncDetails.deviceToken}`, {responseType:'text'}).toPromise()
    const remoteDb = new PouchDB(syncSessionUrl)
    
    let pullReplicationStatus:ReplicationStatus
    
    // If this is the first sync, skip the push.
    if (isFirstSync) {
      if (appConfig.useCachedDbDumps) {
        pullReplicationStatus = await this.pullAll(userDb, remoteDb, appConfig, syncDetails);
      } else {
        try {
          pullReplicationStatus = await this.pull(userDb, remoteDb, appConfig, syncDetails, this.initialBatchSize);
        } catch (e) {
          console.log("Error with pull: " + e)
        }
      }
      const lastLocalSequence = (await userDb.changes({descending: true, limit: 1})).last_seq
      await this.variableService.set('sync-push-last_seq', lastLocalSequence)
      console.log("Setting sync-push-last_seq to " + lastLocalSequence)
      return pullReplicationStatus
    } else {
      try {
        pullReplicationStatus = await this.pull(userDb, remoteDb, appConfig, syncDetails, batchSize);
      } catch (e) {
        console.log("Error with pull: " + e)
      }
      if (pullReplicationStatus?.pullConflicts.length > 0 && appConfig.autoMergeConflicts) {
        await this.conflictService.resolveConflicts(pullReplicationStatus, userDb, remoteDb, 'pull', caseDefinitions);
      }
    }
    
    let pushReplicationStatus = await this.push(userDb, remoteDb, appConfig, syncDetails);
    let replicationStatus = {...pullReplicationStatus, ...pushReplicationStatus}
    return replicationStatus
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
    
    let batchFailureDetected = false
    let batchError;

    const pushSyncBatch = (syncOptions) => {
      return new Promise( (resolve, reject) => {
        const direction = 'push'
        const progress = {
          'direction': direction,
          'remaining': syncOptions.remaining
        }
        this.syncMessage$.next(progress)
        userDb.db['replicate'].to(remoteDb, syncOptions).on('complete', async (info) => {
          // console.log("info.last_seq: " + info.last_seq)
          // const remaining = Math.round(info.docs_written/docIdsLength * 100)
          // Does it push all docs in the batch even if there is an error?
          status = <ReplicationStatus>{
            pushed: info.docs_written,
            info: info,
            direction: direction
          }
          resolve(status)
        }).on('change', async (info) => {
          const pushed = syncOptions.pushed + info.docs_written
          // const remaining = Math.round(pushed/docIdsLength * 100)
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
          if (!status) {
            // We need to create an empty status to return so that the code that receives the reject can attach the error.
            status = <ReplicationStatus>{
              remaining: syncOptions.remaining,
              direction: direction
            }
          }
          let errorMessage = "pushSyncBatch failed. error: " + error
          console.log(errorMessage)
          batchFailureDetected = true
          reject(errorMessage);
        });
      })
    }

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
        status = <ReplicationStatus>await pushSyncBatch(syncOptions);
        if (typeof status.pushed !== 'undefined') {
          pushed = pushed + status.pushed
          status.pushed = pushed
        } else {
          status.pushed = pushed
        }
        this.syncMessage$.next(status)
      } catch (e) {
        console.log("Error: " + e)
        // TODO: we may want to retry this batch again, test for internet access and log as needed - create a sync issue
        batchFailureDetected = true
        batchError = e
      }
      
      status.initialPushLastSeq = push_last_seq
      status.currentPushLastSeq = status.info.last_seq

      if (batchFailureDetected) {
        // don't set last_seq
        // TODO: create an issue
        const errorMessageDialog = window['t']('Please re-run the Sync process - it was terminated due to an error. Error: ')
        const errorMessage = errorMessageDialog + batchError
        console.log(errorMessage)
        if (status) {
          status.pushError = errorMessage
        }
        this.syncMessage$.next(status)
      } else {
        // set last_seq
        await this.variableService.set('sync-push-last_seq', status.info.last_seq)
      }
    return status;
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
    
    const pullSyncBatch = (syncOptions):Promise<ReplicationStatus> => {
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
            let errorMessage = "pullSyncBatch failed. error: " + error
            console.log(errorMessage)
            batchFailureDetected = true
            reject(errorMessage)
          });
        } catch (e) {
          console.log("Error replicating: " + e)
        }
      })
    }
    
    // const totalDocIdLength = docIds.length
    let pulled = 0
    // while (docIds.length) {
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
      status = await pullSyncBatch(syncOptions);
      if (typeof status.pulled !== 'undefined') {
        pulled = pulled + status.pulled
        status.pulled = pulled
      } else {
        status.pulled = pulled
      }
      this.syncMessage$.next(status)
    } catch (e) {
      console.log("Error: " + e)
    // TODO: we may want to retry this batch again, test for internet access and log as needed - create a sync issue
      batchFailureDetected = true
      batchError = e
    }
    
    status.initialPullLastSeq = pull_last_seq
    status.currentPushLastSeq = status.info.last_seq
    status.batchSize = batchSize

    if (batchFailureDetected) {
      // don't se last_seq and prompt to re-run
      // TODO: create an issue
      const errorMessageDialog = window['t']('Please re-run the Sync process - it was terminated due to an error. Error: ')
      const errorMessage = errorMessageDialog + batchError
      console.log(errorMessage)
      if (status) {
        status.pullError = errorMessage
      }
      this.syncMessage$.next(status)
    } else {
      if (status?.info?.last_seq ) {
        // set last_seq
        await this.variableService.set('sync-pull-last_seq', status.info.last_seq)
      }
    }
    return status;
  }

  private getPullSelector(syncDetails) {
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

  async pullAll(userDb, remoteDb, appConfig, syncDetails): Promise<ReplicationStatus> {
    let status = <ReplicationStatus>{
      pulled: 0,
      pullConflicts: [],
      info: '',
      remaining: 0,
      direction: 'pull' 
    };
    
    let pull_last_seq = 0;
    
    try {
      // status = await pullSyncBatch(syncOptions);
      const startInfo = await userDb.db.info()
      const startCount = startInfo.doc_count
      status.remaining = 100
      status.message = `Fetching initial data from server.`
      this.syncMessage$.next(status)
      const data = await this.http.get(`${syncDetails.serverUrl}bulk-sync/start/${syncDetails.groupId}/${syncDetails.deviceId}/${syncDetails.deviceToken}`, {observe: 'response', responseType:'text'}).toPromise();
      if (data.status === 200) {
        const response = data.body
        const responseObject = JSON.parse(response)
        const payloadDocCount = responseObject.payloadDocCount
        const pullLastSeq = responseObject.pullLastSeq
        const locationIdentifier = responseObject.locationIdentifier
        // const payload = responseObject.dbDump
        status.message = `Importing ${payloadDocCount} docs`
        this.syncMessage$.next(status)

        const dbDump = await this.http.get(`${syncDetails.serverUrl}bulk-sync/getDbDump/${syncDetails.groupId}/${syncDetails.deviceId}/${syncDetails.deviceToken}/${locationIdentifier}`, {observe: 'response', responseType:'text'}).toPromise();
        if (dbDump.status === 200) {
          const contentLength = dbDump.body.length
          // kudos: https://stackoverflow.com/a/18650828
          function formatBytes(a,b=2){if(0===a)return"0 Bytes";const c=0>b?0:b,d=Math.floor(Math.log(a)/Math.log(1024));return parseFloat((a/Math.pow(1024,d)).toFixed(c))+" "+["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][d]}
          const responseSize = formatBytes(contentLength)
          const payload = dbDump.body
          const writeStream = new window['Memorystream'];
          // TODO: This will crash on large payloads. Split this up.
          writeStream.end(payload);
          await userDb.db.load(writeStream, {batch_size: this.streamBatchSize})
          const endInfo = await userDb.db.info()
          const endCount = endInfo.doc_count
          const docsAdded = endCount - startCount
          const pushLastSeq = endInfo.update_seq
          if (pullLastSeq) {
            await this.variableService.set('sync-pull-last_seq', pullLastSeq)
          }
          await this.variableService.set('sync-push-last_seq', pushLastSeq)
          console.log("Setting sync-pull-last_seq: " + pullLastSeq + " and sync-push-last_seq: " + pushLastSeq)
          status.pulled = docsAdded
          status.remaining = 0
          delete status.message
        }
      } else {
        status.pulled = 0
        status.remaining = 0
        status.message = `Unable to download data from server.`
      }
      this.syncMessage$.next(status)
    } catch (e) {
      const errorMessageDialog = window['t']('Error downloading data. Error: ')
      let errorMessage
      if (typeof e === 'object') {
        errorMessage = errorMessageDialog + e.statusText + " " + e.message
      } else {
        errorMessage = errorMessageDialog + e
      }
      console.log(errorMessage)
      status.pullError = errorMessage
      this.syncMessage$.next(status)
    }

    status.initialPullLastSeq = pull_last_seq

    // if (batchFailureDetected) {
    //   // don't se last_seq and prompt to re-run
    //   // TODO: create an issue
    //   const errorMessageDialog = window['t']('Please re-run the Sync process - it was terminated due to an error. Error: ')
    //   const errorMessage = errorMessageDialog + batchError
    //   console.log(errorMessage)
    //   if (status) {
    //     status.pullError = errorMessage
    //   }
    //   this.syncMessage$.next(status)
    // } else if (totalDocIds > 0 ) {
    //   // set last_seq
    //   await this.variableService.set('sync-pull-last_seq', status.info.last_seq)
    // } else {
    //   // TODO: Do we store the most recent seq id we tried to sync but didn't find any matches?
    // }
    return status;
    }
    
    
}
