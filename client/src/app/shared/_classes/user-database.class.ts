import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBUpsert)
PouchDB.defaults({auto_compaction: true, revs_limit: 1})
const SHARED_USER_DATABASE_NAME = 'shared-user-database'

export class UserDatabase {

  userId:string
  username:string
  name:string
  private db:PouchDB

  constructor(username, userId, shared = false) {
    this.userId = userId
    this.username = username
    this.name = username
    if (shared) {
      this.db = new PouchDB(SHARED_USER_DATABASE_NAME)
    } else {
      this.db = new PouchDB(username)
    }
  }

  async synced(doc) {
    return await this.db.put({
      ...doc,
      tangerineSyncedOn: Date.now()
    })
  }
 
  async get(_id) {
    return await this.db.get(_id)
  }

  async put(doc) {
    return await this.db.put({
      ...doc,
      tangerineModifiedBy: this.userId,
      tangerineModifiedOn: Date.now()
    })
  }

  async post(doc) {
    return await this.db.post({
      ...doc,
      tangerineModifiedBy: this.userId,
      tangerineModifiedOn: Date.now()
    })
  }

  remove(doc) {
    return this.db.remove(doc)
  }

  query(queryName:string, options = {}) {
    return this.db.query(queryName, options)
  }

  destroy() {
    return this.db.destroy()
  }

  changes(options) {
    return this.db.changes(options)
  }

  allDocs(options) {
    return this.db.allDocs(options)
  }

  sync(remoteDb, options) {
    return this.db.sync(remoteDb, options)
  }

  upsert(docId, callback) {
    return this.db.upsert(docId, callback)
  }

  compact() {
    return this.db.compact()
  }
  
} 
