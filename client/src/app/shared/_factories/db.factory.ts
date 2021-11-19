// @ts-ignore
import PouchDB from 'pouchdb';
// @ts-ignore
// import * as PouchDBFind from 'pouchdb-find';
import * as cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
import CryptoPouch from 'crypto-pouch';
import * as PouchDBUpsert from 'pouchdb-upsert';
import debugPouch from 'pouchdb-debug';
PouchDB.plugin(debugPouch);
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBUpsert);
PouchDB.plugin(cordovaSqlitePlugin);
PouchDB.plugin(window['PouchReplicationStream'].plugin);
let PouchDBLoad = (window as { [key: string]: any })["PouchDBLoad"];
PouchDB.plugin({
  loadIt: PouchDBLoad.load
});
PouchDB.adapter('writableStream', window['PouchReplicationStream'].adapters.writableStream);
// const defaults = {revs_limit: 1}
// const defaults = {auto_compaction:true}
const defaults = {}
PouchDB.plugin(CryptoPouch)

export function connectToSqlCipherDb(name, key = '', options):PouchDB {
  let pouchDBOptions = <any>{
    adapter: 'cordova-sqlite',
    location: 'default',
    androidDatabaseImplementation: 2
  };
  if (key) {
    pouchDBOptions.key = key
  }
  if (window['changes_batch_size'] && name === 'shared-user-database') {
    pouchDBOptions.changes_batch_size = window['changes_batch_size']
  }
  try {
    const pouch = new PouchDB(name, {...defaults, ...pouchDBOptions, ...options});
    return pouch
  } catch (e) {
    console.log("Database error: " + e);
    console.trace();
  }
}

export function connectToCryptoPouchDb(name, key = '', options = {}):PouchDB {
  let pouchDBOptions = <any>{}
  if (window['isCordovaApp']) {
    pouchDBOptions = {
      view_adapter: 'cordova-sqlite',
      location: 'default',
      androidDatabaseImplementation: 2
    }
    if (key) {
      pouchDBOptions.key = key
    }
  }
  if (window['changes_batch_size'] && name === 'shared-user-database') {
    pouchDBOptions.changes_batch_size = window['changes_batch_size']
  }
  try {
    const pouch = new PouchDB(name, {...defaults, ...pouchDBOptions, ...options});
    if (key) {
      pouch.crypto(key)
      pouch.cryptoPouchIsEnabled = true
    }
    return pouch
  } catch (e) {
    console.log("Database error: " + e);
    console.trace();
  }
}

export function connectToPouchDb(name, options = {}):PouchDB {
  const pouchDBOptions = <any>{}
  if (window['changes_batch_size'] && name === 'shared-user-database') {
    pouchDBOptions.changes_batch_size = window['changes_batch_size']
  }
  try {
    const pouch = new PouchDB(name, {...defaults, ...pouchDBOptions, ...options});
    return pouch
  } catch (e) {
    console.log("Database error: " + e);
    console.trace();
  }
}

export function DB(name, key = '', options = {}):PouchDB {
  if (window['cryptoPouchRunning']) {
    return connectToCryptoPouchDb(name, key, options)
  } else if (window['sqlCipherRunning']) {
    return connectToSqlCipherDb(name, key, options)
  } else {
    return connectToPouchDb(name, options)
  }
}
