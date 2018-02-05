import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';

import { AppConfigService } from '../../../shared/_services/app-config.service';

@Injectable()
export class SyncingService {
  constructor(
    private appConfigService: AppConfigService,
    private http: Http
  ) { }

  getUserDB(): string {
    return localStorage.getItem('currentUser');
  }

  // @TODO refactor this to use node server
  async getRemoteHost() {
    const appConfig = await this.appConfigService.getAppConfig();
    return appConfig.uploadUrl;
  }

  async getDocsNotUploaded() {
    return await this.getIDsFormsLockedAndNotUploaded();
  }

  async pushAllrecords() {

    try {
      const userDB = await this.getUserDB();
      const remoteHost = await this.getRemoteHost();
      const DB = new PouchDB(userDB);
      const doc_ids = await this.getIDsFormsLockedAndNotUploaded();
      if (doc_ids && doc_ids.length > 0) {
        for (let doc_id of doc_ids) {
          let doc = await DB.get(doc_id)
          await this.http.post(remoteHost, { doc }).toPromise()
          this.markDocsAsUploaded([doc_id]);
        }
        Promise.resolve('Sync Succesfull')
        /*
        DB.replicate.to(remoteHost, { doc_ids })
          .on('change', async (data) => {
            const replicatedDocIds = data.docs.map((doc) => doc._id);
            this.markDocsAsUploaded(replicatedDocIds);
          })
          .on('complete', (data) => (Promise.resolve('Sync Succesfull')))
          .on('error', (err) => (console.error(err)));
        */
      } else {
        Promise.resolve('No Items to Sync');
      }

      return true;
    } catch (error) {
      return Promise.reject(error);
    }

  }


  async getIDsFormsLockedAndNotUploaded() {
    const userDB = this.getUserDB();
    const DB = new PouchDB(userDB);
    const results = await DB.query('tangy-form/responsesLockedAndNotUploaded');
    const docIds = results.rows.map(row => row.key);
    return docIds;
  }

  async getFormsLockedAndUploaded() {
    const userDB = this.getUserDB();
    const DB = new PouchDB(userDB);
    const results = await DB.query('tangy-form/responsesLockedAndUploaded');
    return results.rows;
  }

  async getNumberOfFormsLockedAndUploaded() {
    const result= await this.getFormsLockedAndUploaded();
    return result.length||0;
  }

  async markDocsAsUploaded(replicatedDocIds) {
    PouchDB.plugin(PouchDBUpsert);
    const userDB = await this.getUserDB();
    const DB = new PouchDB(userDB);
    return await Promise.all(replicatedDocIds.map(docId => {
      DB.upsert(docId, (doc) => {
        doc.uploadDatetime = new Date();
        return doc;
      });
    }));
  }

}
