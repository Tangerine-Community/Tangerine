import {_TRANSLATE} from '../translation-marker';
const SHARED_USER_DATABASE_NAME = 'shared-user-database';
import PouchDB from 'pouchdb';
import { DB } from '../_factories/db.factory';

export class UserDatabase {

  userId: string;
  username: string;
  name: string;
  deviceId: string;
  db: PouchDB;

  constructor(username: string, userId: string, key:string = '', deviceId: string, shared = false) {
    this.userId = userId
    this.username = username
    this.name = username
    this.deviceId = deviceId
    if (shared) {
      this.db = DB(SHARED_USER_DATABASE_NAME, key)
    } else {
      this.db = DB(username, key)
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
      tangerineModifiedOn: Date.now(),
      // Backwards compatibility for sync protocol 1. 
      lastModified: Date.now()
    });
  }

  async post(doc) {
    return await this.db.post({
      ...doc,
      tangerineModifiedByUserId: this.userId,
      tangerineModifiedByDeviceId: this.deviceId,
      tangerineModifiedOn: Date.now(),
      // Backwards compatibility for sync protocol 1. 
      lastModified: Date.now()
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
