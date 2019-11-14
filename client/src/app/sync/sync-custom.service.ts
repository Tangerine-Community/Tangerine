import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import { AppConfig } from './../shared/_classes/app-config.class';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { UserDatabase } from 'src/app/shared/_classes/user-database.class';
import { UserService } from 'src/app/shared/_services/user.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ReplicationStatus } from './classes/replication-status.class';
import * as pako from 'pako';

@Injectable({
  providedIn: 'root'
})
export class SyncCustomService {

  constructor(
    private http: HttpClient
  ) { }

  async push(userDb:UserDatabase, appConfig:AppConfig, docIds:Array<string>) {
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

  async downloadQueue() {
    // TODO, only for custom protocol I think.
  }

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
