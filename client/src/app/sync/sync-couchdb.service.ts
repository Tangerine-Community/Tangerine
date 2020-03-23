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
    private variableService: VariableService
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
    let last_seq = await this.variableService.get('sync-checkpoint')
    if (typeof last_seq === 'undefined') {
      last_seq = 0;
    }
    const pouchDbSyncOptions = {
      "since": last_seq
    }

    if (syncDetails.deviceSyncLocations.length > 0) {
      const locationConfig = syncDetails.deviceSyncLocations[0]
      const location = locationConfig.value.slice(-1).pop()
      const selector = {
          [`location.${location.level}`]: {
            '$eq' : location.value
          }
        }
      pouchDbSyncOptions['selector'] = selector
    }

    const replicationStatus = <ReplicationStatus>await new Promise((resolve, reject) => {
      userDb.sync(remoteDb, pouchDbSyncOptions).on('complete', async  (info) => {
        await this.variableService.set('sync-checkpoint', info.pull.last_seq)
        const conflictsQuery = await userDb.query('sync-conflicts');
        resolve(<ReplicationStatus>{
          pulled: info.pull.docs_written,
          pushed: info.push.docs_written,
          conflicts: conflictsQuery.rows.map(row => row.id)
        })
      }).on('change', async (info) => {
        await this.variableService.set('sync-checkpoint', info.change.last_seq)
        const progress = {
          'docs_read': info.change.docs_read,
          'docs_written': info.change.docs_written,
          'doc_write_failures': info.change.doc_write_failures,
          'pending': info.change.pending
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
