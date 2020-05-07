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
  progress = {"written" : 0}

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
      "$or" : syncDetails.formInfos.reduce(($or, formInfo) => {
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
      }, [])
    }
    const pushSelector = {
        "$or" : syncDetails.formInfos.reduce(($or, formInfo) => {
          if (formInfo.couchdbSyncSettings && formInfo.couchdbSyncSettings.enabled && formInfo.couchdbSyncSettings.push) {
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
        }, [])
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
    const pushSyncOptions = {
      "since": push_last_seq,
      "batch_size": 20,
      "batches_limit": 1,
      ...appConfig.couchdbPush4All ? { } : { "selector": pushSelector },
      "checkpoint": false
    }

    let replicationStatus = await this.doPush(userDb, remoteDb, pushSyncOptions);

    let pullSyncOptions;

    if (appConfig.couchdbPullUsingDocIds) {

      const MAX_IDS = 250;
      const remoteIds = await remoteDb.find({
        'limit': 987654321,
        'fields': ['_id'],
        'selector': pullSelector
      });

      // split the remoteIds docs array into memory-friendly chonks.

      /**
       * Returns an array with arrays of the given size.
       *
       * @param myArray {Array} Array to split
       * @param chunkSize {Integer} Size of every group
       */
      function chunkArray(myArray, chunk_size){
        const results = [];
        while (myArray.length) {
          results.push(myArray.splice(0, chunk_size));
        }
        return results;
      }

      const chonks = chunkArray(remoteIds.docs, MAX_IDS);

      for (let index = 0; index < chonks.length; index++) {
        const theseRemoteIds = chonks[index]
        pullSyncOptions = {
          "since": pull_last_seq,
          "batch_size": 50,
          "batches_limit": 1,
          "doc_ids": theseRemoteIds.map(doc => doc._id),
          "checkpoint": false
        }
        replicationStatus = await this.doPull(userDb, remoteDb, pullSyncOptions);
      }
    } else {
      pullSyncOptions = {
        "since": pull_last_seq,
        "batch_size": 50,
        "batches_limit": 1,
        "selector": pullSelector
      }
      replicationStatus = await this.doPull(userDb, remoteDb, pullSyncOptions);
    }
    return replicationStatus
  }

  async doPush(userDb, remoteDb, pouchSyncOptions) {
    const status = <ReplicationStatus>await new Promise((resolve, reject) => {
      userDb.db['replicate'].to(remoteDb, pouchSyncOptions).on('complete', async (info) => {
        await this.variableService.set('sync-push-last_seq', info.last_seq);
        const conflictsQuery = await userDb.query('sync-conflicts');
        resolve(<ReplicationStatus>{
          pushed: info.docs_written,
          conflicts: conflictsQuery.rows.map(row => row.id)
        });
      }).on('change', async (info) => {
        await this.variableService.set('sync-push-last_seq', info.last_seq);
        // const pending = info.pending;
        let direction = info.direction;
        if (typeof info.direction === 'undefined') {
          direction = '';
        }
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
      }).on('error', function (errorMessage) {
        console.log('boo, something went wrong! error: ' + errorMessage);
        reject(errorMessage);
      });
    });
    return status;
  }

  async doPull(userDb, remoteDb, pouchSyncOptions) {
    const status = <ReplicationStatus>await new Promise((resolve, reject) => {
      userDb.db['replicate'].from(remoteDb, pouchSyncOptions).on('complete', async (info) => {
        await this.variableService.set('sync-pull-last_seq', info.last_seq);
        const conflictsQuery = await userDb.query('sync-conflicts');
        resolve(<ReplicationStatus>{
          pulled: info.docs_written,
          conflicts: conflictsQuery.rows.map(row => row.id)
        });
      }).on('change', async (info) => {
        await this.variableService.set('sync-pull-last_seq', info.last_seq);
        let direction = info.direction;
        if (typeof info.direction === 'undefined') {
          direction = '';
        }
        const pregressWritten = info.docs_written + this.progress.written;
        const progress = {
          'docs_read': info.docs_read,
          'docs_written': pregressWritten,
          'doc_write_failures': info.doc_write_failures,
          // 'pending': info.pending,
          'direction': direction
        };
        this.progress.written = pregressWritten
        this.syncMessage$.next(progress);
      }).on('active', function (info) {
        if (info) {
          console.log('Pull replication is active. Info: ' + JSON.stringify(info));
        } else {
          console.log('Pull replication is active.');
        }
      }).on('error', function (errorMessage) {
        console.log('boo, something went wrong! error: ' + errorMessage);
        reject(errorMessage);
      });
    });
    return status;
  }
}
