import { LocationConfig } from './../device/classes/device.class';
import { HttpClient } from '@angular/common/http';
import { ReplicationStatus } from './classes/replication-status.class';
import { AppConfig } from 'src/app/shared/_classes/app-config.class';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { UserDatabase } from './../shared/_classes/user-database.class';
import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb'
import {Subject} from 'rxjs';
import {VariableService} from '../shared/_services/variable.service';
import {AppConfigService} from '../shared/_services/app-config.service';
import { AppContext } from '../app-context.enum';

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

  constructor(
    private http: HttpClient,
    private variableService: VariableService,
    private appConfigService: AppConfigService
  ) { }

  /*
   Note that if you run this with no forms configured to CouchDB sync,
   that will result in no filter query and everything will be synced. Use carefully.
  */
  async sync(userDb:UserDatabase, syncDetails:SyncCouchdbDetails): Promise<ReplicationStatus> {
    const appConfig = await this.appConfigService.getAppConfig()
    const syncSessionUrl = await this.http.get(`${syncDetails.serverUrl}sync-session/start/${syncDetails.groupId}/${syncDetails.deviceId}/${syncDetails.deviceToken}`, {responseType:'text'}).toPromise()
    const remoteDb = new PouchDB(syncSessionUrl)
    // From Form Info, generate the pull and push selectors.
    const pullSelector = {
      "$or" : [
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
    // Get the sequences we'll be starting with.
    let pull_last_seq = await this.variableService.get('sync-pull-last_seq')
    let push_last_seq = await this.variableService.get('sync-push-last_seq')
    if (typeof pull_last_seq === 'undefined') {
      pull_last_seq = 0;
    }
    if (typeof push_last_seq === 'undefined') {
      push_last_seq = 0;
    }

    // First do the push:
    // Build the PouchSyncOptions.
    // TODO: consider using a similar doc_id approach
    const pushSyncOptions = {
      "since": push_last_seq,
      "batch_size": 50,
      "batches_limit": 1,
      ...appConfig.couchdbPush4All ? { } : appConfig.couchdbPushUsingDocIds
        ? {
          "doc_ids": (await userDb.db.find({
            "limit": 987654321,
            "fields": ["_id"],
            "selector":  pushSelector
          })).docs.map(doc => doc._id)
        }
        : {
          "selector": pushSelector
        }
    }

    let replicationStatus = await this.push(userDb, remoteDb, pushSyncOptions);

    let pullSyncOptions = {
        "since": pull_last_seq,
        "batch_size": 50,
        "batches_limit": 1,
        ...appConfig.couchdbPullUsingDocIds
          ? {
            "doc_ids": (await remoteDb.find({
              "limit": 987654321,
              "fields": ["_id"],
              "selector":  pullSelector
            })).docs.map(doc => doc._id)
          }
          : {
            "selector": pullSelector
          }
      }
      replicationStatus = await this.pull(userDb, remoteDb, pullSyncOptions);
    // Now that we've pulled, many changes have happened since we pushed that we can skip the next time we push.
    // Find the last sequence in the local database and set the sync-push-last_seq variable.
    const lastLocalSequence = (await userDb.changes({descending: true, limit: 1})).last_seq
    await this.variableService.set('sync-push-last_seq', lastLocalSequence)
    return replicationStatus
  }

  async push(userDb, remoteDb, pouchSyncOptions) {
    const status = <ReplicationStatus>await new Promise((resolve, reject) => {
      let checkpointProgress = 0, diffingProgress = 0, startBatchProgress = 0, pendingBatchProgress = 0
      const direction =  'push'
      userDb.db['replicate'].to(remoteDb, pouchSyncOptions).on('complete', async (info) => {
        await this.variableService.set('sync-push-last_seq', info.last_seq);
        const conflictsQuery = await userDb.query('sync-conflicts');
        resolve(<ReplicationStatus>{
          pushed: info.docs_written,
          conflicts: conflictsQuery.rows.map(row => row.id)
        });
      }).on('change', async (info) => {
        await this.variableService.set('sync-push-last_seq', info.last_seq);
        const progress = {
          'docs_read': info.docs_read,
          'docs_written': info.docs_written,
          'doc_write_failures': info.doc_write_failures,
          'pending': info.pending,
          'direction': direction
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
      }).on('error', function (errorMessage) {
        console.log('boo, something went wrong! error: ' + errorMessage);
        reject(errorMessage);
      });
    });
    return status;
  }

  async pull(userDb, remoteDb, pouchSyncOptions) {
    const status = <ReplicationStatus>await new Promise((resolve, reject) => {
      let checkpointProgress = 0, diffingProgress = 0, startBatchProgress = 0, pendingBatchProgress = 0
      const direction =  'pull'
      userDb.db['replicate'].from(remoteDb, pouchSyncOptions).on('complete', async (info) => {
        await this.variableService.set('sync-pull-last_seq', info.last_seq);
        const conflictsQuery = await userDb.query('sync-conflicts');
        resolve(<ReplicationStatus>{
          pulled: info.docs_written,
          conflicts: conflictsQuery.rows.map(row => row.id)
        });
      }).on('change', async (info) => {
        await this.variableService.set('sync-pull-last_seq', info.last_seq);
        const progress = {
          'docs_read': info.docs_read,
          'docs_written': info.docs_written,
          'doc_write_failures': info.doc_write_failures,
          'pending': info.pending,
          'direction': 'pull'
        };
        this.syncMessage$.next(progress);
      }).on('active', function (info) {
        if (info) {
          console.log('Pull replication is active. Info: ' + JSON.stringify(info));
        } else {
          console.log('Pull replication is active.');
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
          console.log(direction + ': Calculating Checkpoints.');
        }
      }).on('error', function (errorMessage) {
        console.log('boo, something went wrong! error: ' + errorMessage);
        reject(errorMessage);
      });
    });
    return status;
  }
}
