// @ts-ignore
import PouchDB from 'pouchdb';
// @ts-ignore
import PouchDBFind from 'pouchdb-find';
import cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
import * as PouchDBUpsert from 'pouchdb-upsert';
import {_TRANSLATE} from '../translation-marker';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBUpsert);
PouchDB.plugin(cordovaSqlitePlugin);
PouchDB.defaults({auto_compaction: true, revs_limit: 1});
const SHARED_USER_DATABASE_NAME = 'shared-user-database';

export class UserDatabase {

  userId: string;
  username: string;
  name: string;
  deviceId: string;
  db: PouchDB;

  constructor(username: string, userId: string, key:string, deviceId: string, shared = false) {
    this.userId = userId;
    this.username = username;
    this.name = username;
    this.deviceId = deviceId;
    let options = {};
    if (window['isCordovaApp'] && key) {
      options = {
        adapter: 'cordova-sqlite',
        key: key,
        location: 'default',
        androidDatabaseImplementation: 2
      };
      window['sqlitePlugin'].openDatabase({name: SHARED_USER_DATABASE_NAME, key: key, location: 'default', androidDatabaseImplementation: 2});
    }
    if (shared) {
      this.db = new PouchDB(SHARED_USER_DATABASE_NAME, options);
    } else {
      this.db = new PouchDB(username, options);
    }
  }

  async synced(doc) {
    return await this.db.put({
      ...doc,
      tangerineSyncedOn: Date.now()
    });
  }

  async get(_id) {
    return await this.db.get(_id);
  }

  async put(doc) {
    return await this.db.put({
      ...doc,
      tangerineModifiedByUserId: this.userId,
      tangerineModifiedByDeviceId: this.deviceId,
      tangerineModifiedOn: Date.now()
    });
  }

  async post(doc) {
    return await this.db.post({
      ...doc,
      tangerineModifiedByUserId: this.userId,
      tangerineModifiedByDeviceId: this.deviceId,
      tangerineModifiedOn: Date.now()
    });
  }

  remove(doc) {
    return this.db.remove(doc);
  }

  query(queryName: string, options = {}) {
    return this.db.query(queryName, options);
  }

  destroy() {
    return this.db.destroy();
  }

  changes(options) {
    return this.db.changes(options);
  }

  allDocs(options) {
    return this.db.allDocs(options);
  }

  sync(remoteDb, options) {
    return this.db.sync(remoteDb, options);
  }

  upsert(docId, callback) {
    return this.db.upsert(docId, callback);
  }

  compact() {
    return this.db.compact();
  }

}
