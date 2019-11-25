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

export class SyncDetails {
  serverUrl:string
  groupId:string
  deviceId:string
  deviceToken:string
  formInfos:Array<FormInfo> = []
  locationQueries:Array<LocationQuery> = []
}

@Injectable({
  providedIn: 'root'
})
export class SyncCouchdbService {

  constructor(
    private http:HttpClient
  ) { }

  async uploadQueue(userDb:UserDatabase, syncDetails:SyncDetails) {
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
  async sync(userDb:UserDatabase, syncDetails:SyncDetails):Promise<ReplicationStatus> {
    const syncSessionUrl = await this.http.get(`${syncDetails.serverUrl}sync-session/start/${syncDetails.groupId}/${syncDetails.deviceId}/${syncDetails.deviceToken}`, {responseType:'text'}).toPromise()
    const remoteDb = new PouchDB(syncSessionUrl)
    const pouchDbSyncOptions ={
      selector: {
        "$or": syncDetails.formInfos.reduce(($or, formInfo) => {
          if (formInfo.couchdbSyncSettings.enabled) {
            $or = [
              ...$or,
              ...syncDetails.locationQueries.length > 0 && formInfo.couchdbSyncSettings.filterByLocation
                ? syncDetails.locationQueries.map(locationQuery => { 
                    return { 
                      "form.id": formInfo.id,
                      [`location.${locationQuery.level}`]: locationQuery.id
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
    // Preemptively mark docs as synced because doing so afterward would create an almost infinite loop of things needing to be synced.
    const uploadQueue = await this.uploadQueue(userDb, syncDetails)
    for (let docId of uploadQueue) {
      const doc = await userDb.get(docId)
      await userDb.synced(doc) 
    }
    const replicationStatus = <ReplicationStatus>await new Promise(async (resolve, reject) => {
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
