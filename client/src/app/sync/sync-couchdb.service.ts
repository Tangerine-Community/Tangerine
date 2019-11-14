import { HttpClient } from '@angular/common/http';
import { ReplicationStatus } from './classes/replication-status.class';
import { AppConfig } from 'src/app/shared/_classes/app-config.class';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { UserDatabase } from './../shared/_classes/user-database.class';
import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb'

@Injectable({
  providedIn: 'root'
})
export class SyncCouchdbService {

  constructor(
    private http:HttpClient
  ) { }

  async uploadQueue(userDb:UserDatabase, formInfos:Array<FormInfo>) {
    const queryKeys = formInfos.reduce((queryKeys, formInfo) => {
      if (formInfo.couchdbSyncSettings.enabled) {
        queryKeys.push([true, formInfo.id, true])
        queryKeys.push([true, formInfo.id, false])
      }
      return queryKeys
    }, [])
    const response = await userDb.query('sync-queue', { keys: queryKeys })
    return response
      .rows
      .map(row => row.id)
  }

  sync(userDb:UserDatabase, appConfig:AppConfig, formInfos:Array<FormInfo>, userProfileId:string):Promise<ReplicationStatus> {
    return new Promise(async (resolve, reject) => {
      try{
        const syncSessionUrl = await this.http.get(`${appConfig.serverUrl}sync-session/start/${appConfig.groupName}/${userProfileId}`, {responseType:'text'}).toPromise()
        const remoteDb = new PouchDB(syncSessionUrl)
        const pouchDbSyncOptions ={
          selector: {
            "$or": formInfos.reduce(($or, formInfo) => {
              if (formInfo.couchdbSyncSettings.enabled) {
                $or.push({ 
                  "form.id": formInfo.id,
                  // @TODO Device defined sync location. 
                })
              }
              return $or
            }, [])
          }
        } 
        // Preemptively mark docs as synced because doing so afterward would create an almost infinite loop of things needing to be synced.
        const uploadQueue = await this.uploadQueue(userDb, formInfos)
        for (let docId of uploadQueue) {
          const doc = await userDb.get(docId)
          await userDb.synced(doc) 
        }
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
      } catch (err) {
        reject(err)
      }
    })
  }
}
