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
  sync(username:string, userProfileId = ''):Promise<ReplicationStatus> {
    return new Promise(async (resolve, reject) => {
      try{
        const config = await this.appConfigService.getAppConfig()
        const localDb = await this.userService.getUserDatabase(username)
        if (!userProfileId) {
          let profileDoc = await this.userService.getUserProfile(username)
          userProfileId = profileDoc._id
        }
        const syncSession = <TwoWaySyncSession>await this.http.get(`${config.serverUrl}sync-session/start/${config.groupName}/${userProfileId}`).toPromise()
        const remoteDb = new PouchDB(syncSession.pouchDbSyncUrl)
        localDb.sync(remoteDb, syncSession.pouchDbSyncOptions).on('complete', async  (info) => {
          const conflictsQuery = await localDb.query('two-way-sync_conflicts');
          const uploadQueue = await this.syncService.getUploadQueue(username, syncSession.formIdsToNotPush)
          await this.syncService.push(username, syncSession.formIdsToNotPush)
          resolve(<ReplicationStatus>{
            pulled: info.pull.docs_written,
            pushed: info.push.docs_written,
            forcePushed: uploadQueue.length,
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
  */

  /*
  replicate() {

  }
  */
  
  /*
  async pull(username) {
      const DB = await this.userService.getUserDatabase(username);
      await DB.put(Object.assign({}, userProfileOnServer, {_rev: userProfile._rev}))
  }
  */
  /*
  async getDocsUploaded(username?: string) {
    const DB = await this.userService.getUserDatabase(username);
    const response = await DB.query('tangy-form/uploadInfo', { keys: [ false ] })
    return response
      .rows
      .map(row => row.id)
  }

  async markDocsAsUploaded(replicatedDocIds, username) {
    const DB = await this.userService.getUserDatabase(username);
    return await Promise.all(replicatedDocIds.map(docId => {
      DB.upsert(docId, (doc) => {
        doc.uploadDatetime = Date.now();
        return doc;
      });
    }));
  }
  */
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

}
