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
  batchSize = 200
  writeBatchSize = 50
  streamBatchSize = 25
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
    if (appConfig.pushChunkSize) {
      this.pushChunkSize = appConfig.pushChunkSize
    }
    if (appConfig.pullChunkSize) {
      this.pullChunkSize = appConfig.pullChunkSize
    }
    const syncSessionUrl = await this.http.get(`${syncDetails.serverUrl}sync-session/start/${syncDetails.groupId}/${syncDetails.deviceId}/${syncDetails.deviceToken}`, {responseType:'text'}).toPromise()
    const remoteDb = new PouchDB(syncSessionUrl)
    
    let pullReplicationStatus:ReplicationStatus
    
    // If this is the first sync, skip the push.
    if (isFirstSync) {
      pullReplicationStatus = await this.pullAll(userDb, remoteDb, appConfig, syncDetails);
      const lastLocalSequence = (await userDb.changes({descending: true, limit: 1})).last_seq
      await this.variableService.set('sync-push-last_seq', lastLocalSequence)
      console.log("Setting sync-push-last_seq to " + lastLocalSequence)
      return pullReplicationStatus
    } else {
      pullReplicationStatus = await this.pull(userDb, remoteDb, appConfig, syncDetails);
      if (pullReplicationStatus.pullConflicts.length > 0 && appConfig.autoMergeConflicts) {
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

    let status;
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
        const docIdsLength = syncOptions.doc_ids.length
        userDb.db['replicate'].to(remoteDb, syncOptions).on('complete', async (info) => {
          // console.log("info.last_seq: " + info.last_seq)
          const remaining = Math.round(info.docs_written/docIdsLength * 100)
          status = <ReplicationStatus>{
            pushed: info.docs_written,
            info: info,
            remaining: remaining,
            direction: direction
          }
          resolve(status)
        }).on('change', async (info) => {
          const pushed = syncOptions.pushed + info.docs_written
          const remaining = Math.round(pushed/docIdsLength * 100)
          const progress = {
            'docs_read': info.docs_read,
            'docs_written': info.docs_written,
            'doc_write_failures': info.doc_write_failures,
            'pending': info.pending,
            'direction': direction,
            'last_seq': info.last_seq,
            'remaining': remaining,
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
    
    let docIdsToPush = []
    const changes = await userDb.db.changes({ since:push_last_seq, include_docs: false })
    if (changes.results.length > 0) {
      for (let change of changes.results) {
        if (!change.id.startsWith('_design')) {
          docIdsToPush.push(change.id)
        }
      }
    }
    
    // const dbInfo = await userDb.db.info()
    // const docCount = dbInfo.doc_count
    // number of times that number is divisible by this.pushChunkSize, and then concat the remainder. 
    // let chunks = new Array(Math.floor(docCount / this.pushChunkSize)).fill(this.pushChunkSize).concat(docCount % this.pushChunkSize)
    // let i=0
    // const totalChunks = chunks.length
    let docIds = []
    let pushed = 0
    // while (docIds.length > 0 || i === 0 ) {
    //   let currentLimit = chunks.shift();
      // const remaining = Math.round(chunks.length/totalChunks * 100)
      // const skip = this.pushChunkSize * i
      // docIds = (await userDb.db.allDocs({
      //   "limit": this.pushChunkSize,
      //   "fields": ["_id"],
      //   "skip": skip
      // })).rows.map(doc => doc.id)
      // // skip = currentLimit
      // console.log("i: " + i + " remaining: " + remaining + " docIds len: " + docIds.length + " skip: " + skip)
    if (docIdsToPush.length > 0) {
      let syncOptions = {
        "doc_ids": docIdsToPush,
        "remaining": 100,
        "pushed": pushed,
        "checkpoint": 'source'
      }

      syncOptions = this.pushSyncOptions ? this.pushSyncOptions : syncOptions

      try {
        status = await pushSyncBatch(syncOptions);
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
    } else {
      status = <ReplicationStatus>{
        pushed: 0,
        info: '',
        remaining: 0,
        direction: 'push'
      };
    }
    return status;
  }

  async pull(userDb, remoteDb, appConfig, syncDetails): Promise<ReplicationStatus> {
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
    const pullSelector = this.getPullSelector(syncDetails);
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
    

    let batchFailureDetected = false
    let batchError;

    const pullSyncBatch = (syncOptions):Promise<ReplicationStatus> => {
      return new Promise( (resolve, reject) => {
        let status = <ReplicationStatus>{
          pulled: 0,
          pullConflicts: [],
          info: '',
          remaining: 0,
          direction: '' 
        }
        const direction = 'pull'
        const progress = {
          'direction': direction,
          'remaining': syncOptions.remaining
        }
        this.syncMessage$.next(progress)
        userDb.db['replicate'].from(remoteDb, syncOptions).on('complete', async (info) => {
          // console.log("info.last_seq: " + info.last_seq)
          const conflictsQuery = await userDb.query('sync-conflicts')
          status = <ReplicationStatus>{
            pulled: info.docs_written,
            pullConflicts: conflictsQuery.rows.map(row => row.id),
            info: info,
            remaining: syncOptions.remaining,
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
            'remaining': syncOptions.remaining,
            'pulled': pulled
          }
          this.syncMessage$.next(progress)
        }).on('error', function (error) {
          if (!status) {
            // We need to create an empty status to return so that the code that receives the reject can attach the error.
            status = <ReplicationStatus>{
              remaining: syncOptions.remaining,
              direction: direction
            }
          }
          let errorMessage = "pullSyncBatch failed. error: " + error
          console.log(errorMessage)
          batchFailureDetected = true
          reject(errorMessage)
        });
      })
    }
    
    const totalDocIds = docIds.length
    // Overridding pullChunkSize since pouchdb now supports write_batch_size
    this.pullChunkSize = totalDocIds
    let pulled = 0
    while (docIds.length) {
      // let remaining = totalDocIds > this.pullChunkSize ? Math.round(docIds.length/totalDocIds * 100) : 1
      let remaining = Math.round(docIds.length/totalDocIds * 100)
      console.log("docIds.length: " + docIds.length + " / totalDocIds: " + totalDocIds + " * 100 = remaining: " + remaining)
      let chunkDocIds = docIds.splice(0, this.pullChunkSize);
      let syncOptions = {
        "since": pull_last_seq,
        "batch_size": this.batchSize,
        "write_batch_size": this.writeBatchSize,
        "batches_limit": 1,
        "doc_ids": chunkDocIds,
        "remaining": remaining,
        "pulled": pulled,
        "checkpoint": 'source'
      }
      // if totalDocIds < this.pullChunkSize, we still want remaining to be 100% at the start of its processing.
      if (totalDocIds > this.pullChunkSize && docIds.length === 0) {
        remaining = 0
        syncOptions.remaining = 0
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
        break
      }
    }

    status.initialPullLastSeq = pull_last_seq

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
    } else if (totalDocIds > 0 ) {
      // set last_seq
      await this.variableService.set('sync-pull-last_seq', status.info.last_seq)
    } else {
      // TODO: Do we store the most recent seq id we tried to sync but didn't find any matches?
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
      const payload = await this.http.get(`${syncDetails.serverUrl}bulk-sync/start/${syncDetails.groupId}/${syncDetails.deviceId}/${syncDetails.deviceToken}`, {responseType:'text'}).toPromise()
      if (payload) {
        const firstLine = payload.split('\n')[0];
        const ndjObject = JSON.parse(firstLine)
        let payloadDocCount
        if (ndjObject) {
          payloadDocCount = ndjObject.db_info?.doc_count
        }
        status.message = `Importing ${payloadDocCount} docs`
        this.syncMessage$.next(status)
        const writeStream = new window['Memorystream'];
        writeStream.end(payload);
        console.log(`Proxy: ${remoteDb.name}`)
        // const pullSelector = this.getPullSelector(syncDetails);
        // await userDb.db.load(writeStream)
        // await userDb.db.load(writeStream, {proxy: `${remoteDb.name}`, selector: pullSelector})
        await userDb.db.load(writeStream, {batch_size: this.streamBatchSize})
        const endInfo = await userDb.db.info()
        const endCount = endInfo.doc_count
        const docsAdded = endCount - startCount
        status.pulled = docsAdded
        status.remaining = 0
        delete status.message
      } else {
        status.pulled = 0
        status.remaining = 0
        status.message = `Unable to download data from server.`
      }
      this.syncMessage$.next(status)
    } catch (e) {
      const errorMessageDialog = window['t']('Error downloading data. Error: ')
      const errorMessage = errorMessageDialog + e
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
