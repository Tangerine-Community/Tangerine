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
    return replicationStatus
  }

  async push(userDb, remoteDb, pouchSyncOptions) {
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
        const progress = {
          'docs_read': info.docs_read,
          'docs_written': info.docs_written,
          'doc_write_failures': info.doc_write_failures,
          'pending': info.pending,
          'direction': 'push'
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

  async pull(userDb, remoteDb, pouchSyncOptions) {
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
      }).on('error', function (errorMessage) {
        console.log('boo, something went wrong! error: ' + errorMessage);
        reject(errorMessage);
      });
    });
    return status;
  }
}
