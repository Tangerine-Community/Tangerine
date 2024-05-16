import {_TRANSLATE} from '../translation-marker';
const SHARED_USER_DATABASE_NAME = 'shared-user-database';
import PouchDB from 'pouchdb';
import { DB } from '../_factories/db.factory';
import * as jsonpatch from "fast-json-patch";

export class UserDatabase {

  userId: string;
  username: string;
  name: string;
  deviceId: string;
  buildId:string;
  buildChannel:string;
  groupId:string;
  db: PouchDB;
  attachHistoryToDocs:boolean

  constructor(username: string, userId: string, key:string = '', deviceId: string, shared = false, buildId = '', buildChannel = '', groupId = '', attachHistoryToDocs = false) {
    this.userId = userId
    this.username = username
    this.name = username
    this.deviceId = deviceId
    this.buildId = buildId
    this.buildChannel = buildChannel
    this.groupId = groupId 
    this.attachHistoryToDocs = attachHistoryToDocs 
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
    const doc = await this.db.get(_id);
    // @TODO Temporary workaround for CryptoPouch bug where it doesn't include the _rev when getting a doc.
    if (this.db.cryptoPouchIsEnabled) {
      const tmpDb = new PouchDB(this.db.name)
      const encryptedDoc = await tmpDb.get(_id)
      doc._rev = encryptedDoc._rev
    }
    return doc
  }

  async put(doc) {
    const newDoc = {
      ...doc,
      tangerineModifiedByUserId: this.userId,
      tangerineModifiedByDeviceId: this.deviceId,
      tangerineModifiedOn: Date.now(),
      buildId: this.buildId,
      deviceId: this.deviceId,
      groupId: this.groupId,
      buildChannel: this.buildChannel,
      // Backwards compatibility for sync protocol 1. 
      lastModified: Date.now()
    }
    return await this.db.put({
      ...newDoc,
      ...this.attachHistoryToDocs
        ? { history: await this._calculateHistory(newDoc) }
        : { }
    });
  }

  async post(doc) {
    const newDoc = {
      ...doc,
      tangerineModifiedByUserId: this.userId,
      tangerineModifiedByDeviceId: this.deviceId,
      tangerineModifiedOn: Date.now(),
      buildId: this.buildId,
      deviceId: this.deviceId,
      groupId: this.groupId,
      buildChannel: this.buildChannel,
      // Backwards compatibility for sync protocol 1. 
      lastModified: Date.now()
    }
    return await this.db.post({
      ...newDoc,
      ...this.attachHistoryToDocs
        ? { history: await this._calculateHistory(newDoc) }
        : { } 
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

  async _calculateHistory(newDoc) {
    let history = []
    try {
      const currentDoc = await this.db.get(newDoc._id)
      const entry = {
        lastRev: currentDoc._rev,
        patch: jsonpatch.compare(currentDoc, newDoc).filter(mod => mod.path.substr(0,8) !== '/history')
      }
      history = currentDoc.history
        ? [ entry, ...currentDoc.history ]
        : [ entry ]
    } catch (e) {
      const entry = {
        lastRev: 0,
        patch: jsonpatch.compare({}, newDoc).filter(mod => mod.path.substr(0,8) !== '/history')
      }
      history = [ entry ]
    }
    return history 
  }

}
