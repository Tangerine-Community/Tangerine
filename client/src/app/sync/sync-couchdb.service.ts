import { _TRANSLATE } from 'src/app/shared/translation-marker';
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
import { SyncDirection } from './sync-direction.enum';
const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))
const retryDelay = 5*1000

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
  public readonly onCancelled$: Subject<any> = new Subject();
  cancelling = false
  syncing = false 
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

  cancel() {
    this.cancelling = true
  }

  finishCancelling(replicationStatus:ReplicationStatus) {
    this.cancelling = false
    this.onCancelled$.next({
      ...replicationStatus,
      cancelled: true
    })
  }

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
    fullSync?:SyncDirection
  ): Promise<ReplicationStatus> {
    // set fullSync
    this.fullSync = fullSync
    // Prepare config.
    const appConfig = await this.appConfigService.getAppConfig()
    this.batchSize = appConfig.batchSize || this.batchSize
    this.initialBatchSize = appConfig.initialBatchSize || this.initialBatchSize
    this.writeBatchSize = appConfig.writeBatchSize || this.writeBatchSize
    let batchSize = (isFirstSync || fullSync === SyncDirection.pull)
      ? this.initialBatchSize
      : this.batchSize
    let replicationStatus:ReplicationStatus
    // Create sync session and instantiate remote database connection.
    let syncSessionUrl
    let remoteDb
    try {
      syncSessionUrl = await this.http.get(`${syncDetails.serverUrl}sync-session/start/${syncDetails.groupId}/${syncDetails.deviceId}/${syncDetails.deviceToken}`, {responseType:'text'}).toPromise()
      remoteDb = new PouchDB(syncSessionUrl)
    } catch (e) {
      replicationStatus = {
        ...replicationStatus,
        pushError: `${_TRANSLATE('Please retry sync. Are you connected to the Internet?')}`
      }
      this.syncMessage$.next(replicationStatus)
      return replicationStatus
    }

    if (this.cancelling) {
      this.finishCancelling(replicationStatus)
      return replicationStatus
    }

    // Push.
    let pushReplicationStatus
    let hadPushSuccess = false
    if (!isFirstSync) {
      while (!hadPushSuccess && !this.cancelling) {
        pushReplicationStatus = await this.push(userDb, remoteDb, appConfig, syncDetails);
        if (!pushReplicationStatus.pushError) {
          hadPushSuccess = true
          await this.variableService.set('sync-push-last_seq', pushReplicationStatus.info.last_seq)
        } else {
          await sleep(retryDelay)
        }
      }
      replicationStatus = {...replicationStatus, ...pushReplicationStatus}
    }

    if (this.cancelling) {
      this.finishCancelling(replicationStatus)
      return replicationStatus
    }

    // Pull.
    let pullReplicationStatus
    let hadPullSuccess = false
    while (!hadPullSuccess && !this.cancelling) {
      try {
        pullReplicationStatus = await this.pull(userDb, remoteDb, appConfig, syncDetails, batchSize);
        if (!pullReplicationStatus.pullError) {
          await this.variableService.set('sync-pull-last_seq', pullReplicationStatus.info.last_seq)
          hadPullSuccess = true
        } else {
          await sleep(retryDelay)
        }
      } catch (e) {
        // Theoretically this.pull shouldn't ever throw an error, but just in case make sure we set that last push sequence.
        const localSequenceAfterPull = (await userDb.changes({descending: true, limit: 1})).last_seq
        await this.variableService.set('sync-push-last_seq', localSequenceAfterPull)
        console.error(e)
        await sleep(retryDelay)
      }
    }
    replicationStatus = {...replicationStatus, ...pullReplicationStatus}

    // Whatever we pulled, even if there was an error, we don't need to push so set last push sequence again.
    const localSequenceAfterPull = (await userDb.changes({descending: true, limit: 1})).last_seq
    await this.variableService.set('sync-push-last_seq', localSequenceAfterPull)

    if (this.cancelling) {
      this.finishCancelling(replicationStatus)
    }

    // All done.
    return replicationStatus
  }

  _push (userDb, remoteDb, syncOptions) {
    return new Promise( (resolve, reject) => {
      let checkpointProgress = 0, diffingProgress = 0, startBatchProgress = 0, pendingBatchProgress = 0
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
      }).on('checkpoint', (info) => {
        if (info) {
          // console.log(direction + ': Checkpoint - Info: ' + JSON.stringify(info));
          let progress;
          if (info.checkpoint) {
            checkpointProgress = checkpointProgress + 1
            progress = {
              'message': checkpointProgress,
              'type': 'checkpoint',
              'direction': direction
            };
          } else if (info.diffing) {
            diffingProgress = diffingProgress + 1
            progress = {
              'message': diffingProgress,
              'type': 'diffing',
              'direction': direction
            };
          } else if (info.startNextBatch) {
            startBatchProgress = startBatchProgress + 1
            progress = {
              'message': startBatchProgress,
              'type': 'startNextBatch',
              'direction': direction
            };
          } else if (info.pendingBatch) {
            pendingBatchProgress = pendingBatchProgress + 1
            progress = {
              'message': pendingBatchProgress,
              'type': 'pendingBatch',
              'direction': direction
            };
          } else {
            progress = {
              'message': JSON.stringify(info),
              'type': 'other',
              'direction': direction
            };
          }
          this.syncMessage$.next(progress);
        } else {
          console.log(direction + ': Calculating Checkpoints.');
        }
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
      "changes_batch_size": appConfig.changes_batch_size ? appConfig.changes_batch_size : null,
      "remaining": 100,
      "pushed": pushed,
      "checkpoint": 'source',
       "filter": function (doc) {
        return doc._id.substr(0,7) !== '_design';
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
      const errorMessageDialog = window['t']('Error: ')
      const errorMessage = errorMessageDialog + status.pushError
      status.error = errorMessage
      console.error(status)
      this.syncMessage$.next(status)
    } else {
    }
    return status;
  }

  _pull(userDb, remoteDb, syncOptions):Promise<ReplicationStatus> {
    return new Promise( (resolve, reject) => {
      let checkpointProgress = 0, diffingProgress = 0, startBatchProgress = 0, pendingBatchProgress = 0
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
        }).on('checkpoint', (info) => {
          if (info) {
            // console.log(direction + ': Checkpoint - Info: ' + JSON.stringify(info));
            let progress;
            if (info.checkpoint) {
              checkpointProgress = checkpointProgress + 1
              progress = {
                'message': checkpointProgress,
                'type': 'checkpoint',
                'direction': direction
              };
            } else if (info.diffing) {
              diffingProgress = diffingProgress + 1
              progress = {
                'message': diffingProgress,
                'type': 'diffing',
                'direction': direction
              };
            } else if (info.startNextBatch) {
              startBatchProgress = startBatchProgress + 1
              progress = {
                'message': startBatchProgress,
                'type': 'startNextBatch',
                'direction': direction
              };
            } else if (info.pendingBatch) {
              pendingBatchProgress = pendingBatchProgress + 1
              progress = {
                'message': pendingBatchProgress,
                'type': 'pendingBatch',
                'direction': direction
              };
            }
            this.syncMessage$.next(progress);
          } else {
            console.log(direction + ': Calculating Checkpoints.');
          }
        }).on('error', function (error) {
          reject(error)
        });
      } catch (e) {
        console.log("Error replicating: " + e)
      }
    })
  }

  async pull(userDb, remoteDb, appConfig, syncDetails, batchSize): Promise<ReplicationStatus> {
    let status = <ReplicationStatus>{
      pulled: 0,
      pullError: '',
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
      'message': 'Received data from remote server.'
    }
    this.syncMessage$.next(progress)
    let failureDetected = false
    let error;
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
      "checkpoint": 'target',
      "changes_batch_size": appConfig.changes_batch_size ? appConfig.changes_batch_size : null
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
      failureDetected = true
      error = e
    }
    
    status.initialPullLastSeq = pull_last_seq
    status.currentPushLastSeq = status.info.last_seq
    status.batchSize = batchSize

    if (failureDetected) {
      status.pullError = `${error.message || error}. ${window['t']('Trying again')}.`
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
          ? syncDetails.deviceSyncLocations.reduce((filters, locationConfig) => {
            // Get last value, that's the focused sync point.
            let location = locationConfig.value.slice(-1).pop()
            return [
              ...filters,
              {
                "type": "issue",
                [`location.${location.level}`]: location.value,
                "sendToAllDevices": true 
              },
              {
                "type": "issue",
                [`location.${location.level}`]: location.value,
                "sendToDeviceById": syncDetails.deviceId
              }
            ] 
          }, [])
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
