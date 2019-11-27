import { LocationConfig } from './../device/classes/device.class';
import { HttpClient } from '@angular/common/http';
import { ReplicationStatus } from './classes/replication-status.class';
import { AppConfig } from 'src/app/shared/_classes/app-config.class';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { UserDatabase } from './../shared/_classes/user-database.class';
import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb'

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

  constructor(
    private http:HttpClient
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
  async sync(userDb:UserDatabase, syncDetails:SyncCouchdbDetails):Promise<ReplicationStatus> {
    const syncSessionUrl = await this.http.get(`${syncDetails.serverUrl}sync-session/start/${syncDetails.groupId}/${syncDetails.deviceId}/${syncDetails.deviceToken}`, {responseType:'text'}).toPromise()
    const remoteDb = new PouchDB(syncSessionUrl)
    const pouchDbSyncOptions ={
      selector: {
        "$or": syncDetails.formInfos.reduce(($or, formInfo) => {
          if (formInfo.couchdbSyncSettings && formInfo.couchdbSyncSettings.enabled) {
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
    const replicationStatus = <ReplicationStatus>await new Promise((resolve, reject) => {
      userDb.sync(remoteDb, pouchDbSyncOptions).on('complete', async  (info) => {
        const conflictsQuery = await userDb.query('sync-conflicts');
        resolve(<ReplicationStatus>{
          pulled: info.pull.docs_written,
          pushed: info.push.docs_written,
          conflicts: conflictsQuery.rows.map(row => row.id)
        })
      }).on('error', function (errorMessage) {
        console.log("boo, something went wrong! error: " + errorMessage)
        reject(errorMessage)
      });
    })
    return replicationStatus
  }
}
