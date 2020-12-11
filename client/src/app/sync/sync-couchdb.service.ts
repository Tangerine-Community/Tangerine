import { LocationConfig } from './../device/classes/device.class';
import { HttpClient } from '@angular/common/http';
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
  batchSize = 50
  pushChunkSize = 200
  pullChunkSize = 200
  pullSyncOptions;
  pushSyncOptions;
  
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
    isFirstSync = false
  ): Promise<ReplicationStatus> {
    const appConfig = await this.appConfigService.getAppConfig()
    const syncSessionUrl = await this.http.get(`${syncDetails.serverUrl}sync-session/start/${syncDetails.groupId}/${syncDetails.deviceId}/${syncDetails.deviceToken}`, {responseType:'text'}).toPromise()
    const remoteDb = new PouchDB(syncSessionUrl)
    // From Form Info, generate the pull and push selectors.
   

    // @TODO RJ: What is sync-push-last_seq-start used for? 
    const startLocalSequence = (await userDb.changes({descending: true, limit: 1})).last_seq
    await this.variableService.set('sync-push-last_seq-start', startLocalSequence)

    
    let pullReplicationStatus:ReplicationStatus = await this.pull(userDb, remoteDb, appConfig, syncDetails);
    if (pullReplicationStatus.pullConflicts.length > 0 && appConfig.autoMergeConflicts) {
      await this.conflictService.resolveConflicts(pullReplicationStatus, userDb, remoteDb, 'pull', caseDefinitions);
    }
    // If this is the first sync, skip the push.
    if (isFirstSync) {
      const lastLocalSequence = (await userDb.changes({descending: true, limit: 1})).last_seq
      await this.variableService.set('sync-push-last_seq', lastLocalSequence)
      console.log("Setting sync-push-last_seq to " + lastLocalSequence)
      return pullReplicationStatus
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
    
    const pushSelector = {
      "$or" : [
        ...syncDetails.formInfos.reduce(($or, formInfo) => {
          if (formInfo.couchdbSyncSettings && formInfo.couchdbSyncSettings.enabled && formInfo.couchdbSyncSettings.push) {
            $or = [
              ...$or,
              {
                "form.id": formInfo.id
              }
            ]
          }
          return $or
        }, []),
        {
          "type": "issue"
        }
      ]
    }

    



    

    let status;
    let chunkCompleteStatus = false

    const pushSyncBatch = (syncOptions) => {
      return new Promise( (resolve, reject) => {
        let status = {}
        const direction = 'push'
        userDb.db['replicate'].to(remoteDb, syncOptions).on('complete', async (info) => {
          console.log("info.last_seq: " + info.last_seq)
          chunkCompleteStatus = true
          // TODO: change to remoteDB and check if it is one of the id's we are concerned about
          // don't want to act on docs we are not concerned w/
          // act upon only docs in our region...
          //const conflictsQuery = await userDb.query('sync-conflicts');
          status = <ReplicationStatus>{
            pushed: info.docs_written,
            info: info,
            remaining: syncOptions.remaining
            //pushConflicts: conflictsQuery.rows.map(row => row.id)
          }
          resolve(status)
        }).on('change', async (info) => {
          await this.variableService.set('sync-push-last_seq', info.last_seq);
          const progress = {
            'docs_read': info.docs_read,
            'docs_written': info.docs_written,
            'doc_write_failures': info.doc_write_failures,
            'pending': info.pending,
            'direction': direction,
            'last_seq': info.last_seq,
            'remaining': syncOptions.remaining
          };
          this.syncMessage$.next(progress);
        }).on('active', function (info) {
          if (info) {
            console.log('Push replication is active. Info: ' + JSON.stringify(info));
          } else {
            console.log('Push replication is active.');
          }
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
        }).on('error', function (error) {
          let errorMessage = "pullSyncBatch failed. error: " + error
          console.log(errorMessage)
          chunkCompleteStatus = false
          reject(errorMessage);
        });
      })
    }
    
    let checkpointProgress = 0, diffingProgress = 0, startBatchProgress = 0, pendingBatchProgress = 0

    const dbInfo = await userDb.db.info()
    const docCount = dbInfo.doc_count
    // number of times that number is divisible by this.pushChunkSize, and then concat the remainder. 
    let chunks = new Array(Math.floor(docCount / this.pushChunkSize)).fill(this.pushChunkSize).concat(docCount % this.pushChunkSize)
    let skip = 0;
    let i=0
    const totalChunks = chunks.length
    while (chunks.length > 0) {
      i++
      let currentLimit = chunks.shift();
      const remaining = Math.round(chunks.length/totalChunks * 100)
      let docIds = (await userDb.db.allDocs({
        "limit": currentLimit,
        "fields": ["_id"],
        "skip": skip
      })).rows.map(doc => doc._id)
      skip = currentLimit
      console.log("i: " + i + " remaining: " + remaining + " docIds len: " + docIds.length + " skip: " + skip)
      let syncOptions = {
        "since": push_last_seq,
        "doc_ids": docIds,
        "remaining": remaining
      }

      syncOptions = this.pushSyncOptions ? this.pushSyncOptions : syncOptions

      try {
        status = await pushSyncBatch(syncOptions);
        console.log("status: " + JSON.stringify(status))
        this.syncMessage$.next(status)
      } catch (e) {
        // TODO: we may want to retry this batch again, test for internet access and log as needed - create a sync issue
        chunkCompleteStatus = false
      }
      
    }

    if (!chunkCompleteStatus) {
      // don't se last_seq and prompt to re-run
      const errorMessage = "incomplete-sync"
      console.log(errorMessage)
      if (status) {
        status.error = errorMessage
      }
    } else {
      // set last_seq
      await this.variableService.set('sync-push-last_seq', status.info.last_seq)
    }
    return status;
  }

  async pull(userDb, remoteDb, appConfig, syncDetails): Promise<ReplicationStatus> {
    let pull_last_seq = await this.variableService.get('sync-pull-last_seq')

    if (typeof pull_last_seq === 'undefined') {
      pull_last_seq = 0;
    }
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
    let progress = {
      'direction': 'pull',
      'message': 'Querying the remote server.'
    }
    this.syncMessage$.next(progress)
    let docIds = (await remoteDb.find({
      "limit": 987654321,
      "fields": ["_id"],
      "selector": pullSelector
    })).docs.map(doc => doc._id)
    
    progress = {
      'direction': 'pull',
      'message': 'Received data from remote server.'
    }
    this.syncMessage$.next(progress)
    
    let status;
    let chunkCompleteStatus = false

    const pullSyncBatch = (syncOptions) => {
      return new Promise( (resolve, reject) => {
        let status = {}
        const direction = 'pull'
        const progress = {
          'direction': 'pull',
          'remaining': syncOptions.remaining
        }
        this.syncMessage$.next(progress)
        userDb.db['replicate'].from(remoteDb, syncOptions).on('complete', async (info) => {
          console.log("info.last_seq: " + info.last_seq)
          chunkCompleteStatus = true
          const conflictsQuery = await userDb.query('sync-conflicts')
          status = <ReplicationStatus>{
            pulled: info.docs_written,
            pullConflicts: conflictsQuery.rows.map(row => row.id),
            info: info,
            remaining: syncOptions.remaining
          }
          resolve(status)
        }).on('change', async (info) => {
          await this.variableService.set('sync-pull-last_seq', info.last_seq)
          const progress = {
            'docs_read': info.docs_read,
            'docs_written': info.docs_written,
            'doc_write_failures': info.doc_write_failures,
            'pending': info.pending,
            'direction': 'pull',
            'last_seq': info.last_seq,
            'remaining': syncOptions.remaining
          }
          this.syncMessage$.next(progress)
        }).on('active', function (info) {
          if (info) {
            console.log('Pull replication is active. Info: ' + JSON.stringify(info))
          } else {
            console.log('Pull replication is active.')
          }
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
            console.log('Pull: Calculating Checkpoints.');
          }  
        }).on('error', function (error) {
          let errorMessage = "pullSyncBatch failed. error: " + error
          console.log(errorMessage)
          chunkCompleteStatus = false
          reject(errorMessage)
        });
      })
    }
    
    let checkpointProgress = 0, diffingProgress = 0, startBatchProgress = 0, pendingBatchProgress = 0
    const totalDocIds = docIds.length
    while (docIds.length) {
      let remaining = Math.round(docIds.length/totalDocIds * 100)
      console.log("docIds.length: " + docIds.length + " remaining: " + remaining)
      let chunkDocIds = docIds.splice(0, this.pullChunkSize);
      let syncOptions = {
        "since": pull_last_seq,
        "batch_size": this.batchSize,
        "batches_limit": 1,
        "doc_ids": chunkDocIds,
        "remaining": remaining
      }
      if (docIds.length === 0) {
        remaining = 0
        syncOptions.remaining = 0
      }
      
      syncOptions = this.pullSyncOptions ? this.pullSyncOptions : syncOptions
      
      try {
        status = await pullSyncBatch(syncOptions);
        console.log("status: " + JSON.stringify(status))
        this.syncMessage$.next(status)
      } catch (e) {
      // TODO: we may want to retry this batch again, test for internet access and log as needed - create a sync issue
        chunkCompleteStatus = false
      }
    }
    if (!chunkCompleteStatus) {
      // don't se last_seq and prompt to re-run
      const errorMessage = "incomplete-sync"
      console.log(errorMessage)
      if (status) {
        status.error = errorMessage
      }
    } else {
      // set last_seq
      await this.variableService.set('sync-pull-last_seq', status.info.last_seq)
    }
    return status;
  }
}
