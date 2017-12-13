import { Injectable } from '@angular/core';
import PouchDB from 'pouchdb';

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
  async syncAllRecords() {

    try {
      const userDB = await this.getUserDB();
      const remoteHost = await this.getRemoteHost();
      const result = PouchDB.sync(userDB, remoteHost)
        .on('complete', function (data) {
          return data;
        })
        .on('error', (err) => (err));
    } catch (error) {
    }
  }

  async pushAllrecords() {

    try {
      const userDB = await this.getUserDB();
      const remoteHost = await this.getRemoteHost();
      const DB = new PouchDB(userDB);
      const doc_ids = await this.getFormsLockedAndNotUploaded();
      const result = await DB.replicate.to(remoteHost, { doc_ids });
      return true;
    } catch (error) {
      return Promise.reject(error);
    }

  }

  async pullAllRecords() {
    try {
      const result = PouchDB.replicate(this.getRemoteHost(), this.getUserDB())
        .on('complete', (data) => (data))
        .on('error', (err) => (err));
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

}
