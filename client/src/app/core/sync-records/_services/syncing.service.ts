import { Injectable } from '@angular/core';
import * as PouchDB from 'pouchdb';
import { environment } from '../../../../environments/environment';
@Injectable()
export class SyncingService {
  ALL_DATABASES = environment.databasesToSync;
  REMOTE_HOST = environment.remoteCouchDBHost;
  constructor() { }

  async syncAllRecords() {
    return Promise.all(this.ALL_DATABASES.map(async (db) => {
      const result = await PouchDB.sync(db, this.REMOTE_HOST + db);
      return result;
    }));
  }

  async pushAllrecords() {

    return Promise.all(this.ALL_DATABASES.map(async (db) => {
      const result = await PouchDB.replicate(db, this.REMOTE_HOST + db);
      return result;
    }));
  }

  async pullAllRecords() {
    return Promise.all(this.ALL_DATABASES.map(async (db) => {
      const result = await PouchDB.replicate(this.REMOTE_HOST + db, db);
      return result;
    }));
  }

  async syncSelectedRecords(selectedDBs: string[]) {
    return Promise.all(selectedDBs.map(async (db) => {
      const result = await PouchDB.sync(db, this.REMOTE_HOST + db);
      return result;
    }));
  }

  async pushSelectedRecords(selectedDBs: string[]) {

    return Promise.all(selectedDBs.map(async (db) => {
      const result = await PouchDB.replicate(db, this.REMOTE_HOST + db);
      return result;
    }));
  }

  async pullSelectedRecords(selectedDBs: string[]) {
    return Promise.all(selectedDBs.map(async (db) => {
      const result = await PouchDB.replicate(this.REMOTE_HOST + db, db);
      return result;
    }));
  }

}
