import PouchDB from 'pouchdb';
import { AppConfig } from './../shared/_classes/app-config.class';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { UserDatabase } from 'src/app/shared/_classes/user-database.class';
import { UserService } from 'src/app/shared/_services/user.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplicationStatus } from './classes/replication-status.class';
import * as pako from 'pako';

export const SYNC_MODE_CUSTOM = 'SYNC_MODE_CUSTOM'
export const SYNC_MODE_COUCHDB = 'SYNC_MODE_COUCHDB'
export const SYNC_MODE_ALL = 'SYNC_MODE_ALL'

@Injectable({
  providedIn: 'root'
})
export class SyncService {

  constructor(
    private http: HttpClient
  ) { }


  /*
   * Custom sync
   */

  async customPush(userDb:UserDatabase, appConfig:AppConfig, docIds:Array<string>) {
    try {
      for (const doc_id of docIds) {
        const doc = await userDb.get(doc_id);
        // Redact any fields marked as private.
        doc['items'].forEach(item => {
          item['inputs'].forEach(input => {
            if (input.private) {
              input.value = '';
            }
          });
        });
        const body = pako.deflate(JSON.stringify({ doc }), { to: 'string' });
        const response = <any>await this.http.post(`${appConfig.serverUrl}api/${appConfig.groupName}/upload`, body, {
          headers: new HttpHeaders({
            'Authorization': appConfig.uploadToken
          })
        }).toPromise();
        if (!response && !response.status && response.status !== 'ok') {
          throw(new Error('Unable to sync, try again.'))
        } else {
          await userDb.synced(doc)
        }
      }
      return true; // No Items to Sync
    } catch (error) {
      throw (error);
    }
    // @TODO Mark docs as synced.
  }

  async customDownloadQueue() {
    // TODO, only for custom protocol I think.
  }

  async customUploadQueue(userDb:UserDatabase, formInfos:Array<FormInfo>) {
    let queryKeys = formInfos.reduce((queryKeys, formInfo) => {
      if (formInfo.customSyncSettings.enabled && formInfo.customSyncSettings.push) {
        if (formInfo.customSyncSettings.excludeIncomplete) {
          queryKeys.push([true, formInfo.id, true])
        } else {
          queryKeys.push([true, formInfo.id, true])
          queryKeys.push([true, formInfo.id, false])
        }
      }
      return queryKeys
    }, []) 
    const response = await userDb.query('sync-queue', { keys: queryKeys })
    return response
      .rows
      .map(row => row.id)
  }

  /*
   * CouchDB sync
   */

  async couchdbUploadQueue(userDb:UserDatabase, formInfos:Array<FormInfo>) {
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

  couchdbSync(userDb:UserDatabase, appConfig:AppConfig, formInfos:Array<FormInfo>, userProfileId:string):Promise<ReplicationStatus> {
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
        const uploadQueue = await this.couchdbUploadQueue(userDb, formInfos)
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
