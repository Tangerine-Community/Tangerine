import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';

import { AppConfigService } from '../../../shared/_services/app-config.service';

@Injectable()
export class SyncingService {
  constructor(private appConfigService: AppConfigService) { }

  getUserDB(): string {
    return localStorage.getItem('currentUser');
  }
  // @TODO refactor this to use node server
  async getRemoteHost() {

    const appConfig = await this.appConfigService.getAppConfig();
    return appConfig.remoteCouchDBHost;
  }

  async pushAllrecords() {

    try {
      const userDB = await this.getUserDB();
      const remoteHost = await this.getRemoteHost();
      const DB = new PouchDB(userDB);
      const doc_ids = await this.getFormsLockedAndNotUploaded();
      if (doc_ids && doc_ids.length > 0) {
        DB.replicate.to(remoteHost, { doc_ids })
          .on('change', async (data) => {
            const replicatedDocIds = data.docs.map((doc) => doc._id);
            this.markDocsAsUploaded(replicatedDocIds);
          })
          .on('complete', (data) => (Promise.resolve('Sync Succesfull')))
          .on('error', (err) => (console.error(err)));
      } else {
        Promise.resolve('No Items to Sync');
      }

      return true;
    } catch (error) {
      return Promise.reject(error);
    }

  }


  async getFormsLockedAndNotUploaded() {
    const userDB = this.getUserDB();
    const DB = new PouchDB(userDB);
    const results = await DB.query('tangy-form/responsesLockedAndNotUploaded');
    const docIds = results.rows.map(row => row.key);
    return docIds;
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
