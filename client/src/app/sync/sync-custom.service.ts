import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { AppConfig } from './../shared/_classes/app-config.class';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { UserDatabase } from 'src/app/shared/_classes/user-database.class';
import { UserService } from 'src/app/shared/_services/user.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ReplicationStatus } from './classes/replication-status.class';
import * as pako from 'pako';

export class SyncCustomDetails {
  serverUrl:string
  groupId:string
  deviceId:string
  deviceToken:string
  formInfos:Array<FormInfo> = []
  appConfig:AppConfig
}

@Injectable({
  providedIn: 'root'
})
export class SyncCustomService {

  constructor(
    private http: HttpClient
  ) { }

  async sync(userDb:UserDatabase, syncDetails:SyncCustomDetails) {
    const uploadQueue = await this.uploadQueue(userDb, syncDetails.formInfos)
    if (uploadQueue.length > 0) {
      await this.push(userDb, syncDetails, uploadQueue)
    }
    // @TODO pull
  }

  async push(userDb:UserDatabase, syncDetails:SyncCustomDetails, docIds:Array<string>) {
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
        const response = <any>await this.http.post(`${syncDetails.serverUrl}sync-custom/push/${syncDetails.groupId}/${doc_id}/${syncDetails.deviceId}/${syncDetails.deviceToken}`, body).toPromise();
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

  async downloadQueue() {
    // TODO, only for custom protocol I think.
  }

  /*
  Generates a list of docIds by querying sync-queue with an array of keys with properties: [needsUploading, formId, isComplete]
   */
  async uploadQueue(userDb:UserDatabase, formInfos:Array<FormInfo>) {
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
}
