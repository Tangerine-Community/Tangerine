import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';
import * as pako from 'pako';

import { AppConfigService } from '../../../shared/_services/app-config.service';
import { UserService } from '../../auth/_services/user.service';
import { WindowRef } from '../../window-ref.service';

@Injectable()
export class SyncingService {
  window;
  constructor(
    private windowRef: WindowRef,
    private appConfigService: AppConfigService,
    private http: HttpClient,
    private userService: UserService
  ) { 
    this.window = this.windowRef.nativeWindow;
  }

  getLoggedInUser(): string {
    return localStorage.getItem('currentUser');
  }

  async pushAllrecords(username) {
    try {
      const userProfile = await this.userService.getUserProfile(username);
      const appConfig = await this.appConfigService.getAppConfig()
      const DB = new PouchDB(username);
      const doc_ids = await this.getIDsFormsLockedAndNotUploaded(username);
      if (doc_ids && doc_ids.length > 0) {
        for (const doc_id of doc_ids) {
          const doc = await DB.get(doc_id);
          // Insert the userProfileId as an input.
          doc['items'][0]['inputs'].push({ name: 'userProfileId', value: userProfile._id });
          // Redact any fields marked as private.
          doc['items'].forEach(item => {
            item['inputs'].forEach(input => {
              if (input.private) {
                input.value = '';
              }
            });
          });
          const body = pako.deflate(JSON.stringify({ doc }), { to: 'string' });
          await this.http.post(`${appConfig.serverUrl}api/${appConfig.groupName}/upload`, body, {
            headers: new HttpHeaders({
              'Authorization': appConfig.uploadToken
            }) 
          }).toPromise();
          await this.markDocsAsUploaded([doc_id], username);
        }
      }
      return true; // No Items to Sync
    } catch (error) {
      throw (error);
    }
  }

  async getIDsFormsLockedAndNotUploaded(username?: string) {
    const userProfile = await this.userService.getUserProfile(username);
    const userDB = username || await this.getLoggedInUser();
    const DB = new PouchDB(userDB);
    const appConfig = await this.appConfigService.getAppConfig()
    const results = await DB.query('tangy-form/responsesLockedAndNotUploaded');
    const docIds = results.rows.map(row => row.key);
    if (!this.window.navigator.onLine) {
      return docIds
    } else {
      // Look for responses marked as uploaded but the server doesn't have.
      const responsesLockedAndUploaded = await DB.query('tangy-form/responsesLockedAndUploaded');
      try {
        const hasKeys = await this.http.post(
          `${appConfig.serverUrl}api/${appConfig.groupName}/upload-check`, 
            { keys: responsesLockedAndUploaded.rows.map(row => row.id) }, 
            { headers: new HttpHeaders({ 'Authorization': appConfig.uploadToken }) 
          }).toPromise()
          return [
            ...docIds,
            ...responsesLockedAndUploaded.rows
          .filter(row => hasKeys['indexOf'](row.id) === -1)
              .map(row => row.id)
          ]
      }
      catch(err) {
        // Perhaps window.onLine is true but we're having trouble communicating with the server.
        console.log(err)
        return docIds
      }
    }
  }

  async getFormsLockedAndUploaded(username?: string) {
    const userDB = username || await this.getLoggedInUser();
    const DB = new PouchDB(userDB);
    const results = await DB.query('tangy-form/responsesLockedAndUploaded');
    return results.rows;
  }

  async getNumberOfFormsLockedAndUploaded(username?: string) {
    const result = username ? await this.getFormsLockedAndUploaded(username) : await this.getFormsLockedAndUploaded();
    return result.length || 0;
  }

  async getAllUsersDocs(username?: string) {
    const userDB = username || await this.getLoggedInUser();
    const DB = new PouchDB(userDB);
    try {
      const result = await DB.allDocs({
        include_docs: true,
        attachments: true
      });
      return result;
    } catch (err) {
      console.log(err);
    }
  }
  async markDocsAsUploaded(replicatedDocIds, username) {
    PouchDB.plugin(PouchDBUpsert);
    const userDB = username;
    const DB = new PouchDB(userDB);
    return await Promise.all(replicatedDocIds.map(docId => {
      DB.upsert(docId, (doc) => {
        doc.uploadDatetime = new Date();
        return doc;
      });
    }));
  }

}
