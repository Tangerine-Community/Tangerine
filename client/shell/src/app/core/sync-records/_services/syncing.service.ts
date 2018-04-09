import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';
import * as pako from 'pako';

import { AppConfigService } from '../../../shared/_services/app-config.service';
import { UserService } from '../../auth/_services/user.service';

@Injectable()
export class SyncingService {
  constructor(
    private appConfigService: AppConfigService,
    private http: Http,
    private userService: UserService
  ) { }

  getLoggedInUser(): string {
    return localStorage.getItem('currentUser');
  }

  async getRemoteHost() {
    const appConfig = await this.appConfigService.getAppConfig();
    return appConfig.uploadUrl;
  }

  async pushAllrecords(username) {
    try {
      const userProfile = await this.userService.getUserProfile(username);
      const remoteHost = await this.getRemoteHost();
      const DB = new PouchDB(username);
      const doc_ids = await this.getIDsFormsLockedAndNotUploaded(username);
      if (doc_ids && doc_ids.length > 0) {
        for (const doc_id of doc_ids) {
          const doc = await DB.get(doc_id);
          doc['items'][0]['inputs'].push({ name: 'userProfileId', value: userProfile._id });
          doc['items'].forEach(item => {
            item['inputs'].forEach(input => {
              if (input.private) {
                input.value = '';
              }
            })
          })
          const body = pako.deflate(JSON.stringify({ doc }), {to: 'string'})
          await this.http.post(remoteHost, body).toPromise();
          await this.markDocsAsUploaded([doc_id], username);
        }
        return true;// Sync Successful
      } else {
        return false;// No Items to Sync
      }
    } catch (error) {
      throw (error);
    }

  }


  async getIDsFormsLockedAndNotUploaded(username?: string) {
    const userDB = username || await this.getLoggedInUser();
    const DB = new PouchDB(userDB);
    const results = await DB.query('tangy-form/responsesLockedAndNotUploaded');
    const docIds = results.rows.map(row => row.key);
    return docIds;
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
