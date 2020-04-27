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

  async uploadQueue(userDb:UserDatabase, syncDetails:SyncCouchdbDetails) {
    const queryKeys = syncDetails.formInfos.reduce((queryKeys, formInfo) => {
      if (formInfo.couchdbSyncSettings.enabled) {
        queryKeys.push([true, formInfo.id])
      }
      return queryKeys
    }, [])
    const response = await userDb.query('sync-queue', { keys: queryKeys })
    return response
      .rows
      .map(row => row.id)
  }

  // Note that if you run this with no forms configured to CouchDB sync, that will result in no filter query and everything will be synced. Use carefully.
  async sync(userDb:UserDatabase, syncDetails:SyncCouchdbDetails): Promise<ReplicationStatus> {
    const syncSessionUrl = await this.http.get(`${syncDetails.serverUrl}sync-session/start/${syncDetails.groupId}/${syncDetails.deviceId}/${syncDetails.deviceToken}`, {responseType:'text'}).toPromise()
    const remoteDb = new PouchDB(syncSessionUrl)
    let pull_last_seq = await this.variableService.get('sync-pull-last_seq')
    let push_last_seq = await this.variableService.get('sync-push-last_seq')
    if (typeof pull_last_seq === 'undefined') {
      pull_last_seq = 0;
    }
    if (typeof push_last_seq === 'undefined') {
      push_last_seq = 0;
    }

    const pouchOptions = {
      "push": {
        "since": push_last_seq,
        "batch_size": 50,
        "batches_limit": 1,
        ...(await this.appConfigService.getAppConfig()).couchdbSync4All ? {} : { "selector": {
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
        }
      },
      "pull": {
        "since": pull_last_seq,
        "batch_size": 50,
        "batches_limit": 5,
        "selector": {
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
      }
    }

    const replicationStatus = <ReplicationStatus>await new Promise((resolve, reject) => {
      userDb.sync(remoteDb, pouchOptions).on('complete', async  (info) => {
        await this.variableService.set('sync-push-last_seq', info.push.last_seq)
        await this.variableService.set('sync-pull-last_seq', info.pull.last_seq)
        const conflictsQuery = await userDb.query('sync-conflicts');
        resolve(<ReplicationStatus>{
          pulled: info.pull.docs_written,
          pushed: info.push.docs_written,
          conflicts: conflictsQuery.rows.map(row => row.id)
        })
      }).on('change', async (info) => {
        if (typeof info.direction !== 'undefined') {
          if (info.direction === 'push') {
            await this.variableService.set('sync-push-last_seq', info.change.last_seq)
          } else {
            await this.variableService.set('sync-pull-last_seq', info.change.last_seq)
          }
        }
        let pending = info.change.pending
        let direction = info.direction
        if (typeof info.direction === 'undefined') {
          direction = ''
        }
        const progress = {
          'docs_read': info.change.docs_read,
          'docs_written': info.change.docs_written,
          'doc_write_failures': info.change.doc_write_failures,
          'pending': info.change.pending,
          'direction': direction
        };
        this.syncMessage$.next(progress)
      }).on('error', function (errorMessage) {
        console.log('boo, something went wrong! error: ' + errorMessage)
        reject(errorMessage)
      });
    })
    return replicationStatus
  }
}
