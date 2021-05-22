// @ts-ignore
import PouchDB from 'pouchdb';
// @ts-ignore
// import * as PouchDBFind from 'pouchdb-find';
import CryptoPouch from 'crypto-pouch';
import * as cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
import * as PouchDBUpsert from 'pouchdb-upsert';
import debugPouch from 'pouchdb-debug';
PouchDB.plugin(debugPouch);
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBUpsert);
PouchDB.plugin(CryptoPouch);
PouchDB.plugin(cordovaSqlitePlugin);
PouchDB.plugin(window['PouchReplicationStream'].plugin);
PouchDB.adapter('writableStream', window['PouchReplicationStream'].adapters.writableStream);
PouchDB.defaults({auto_compaction: true, revs_limit: 1});

export function DB(name, key = ''):PouchDB {

  function openCallback (connectionId) {
    console.log('open connection id: ' + connectionId)
  }

  function errorCallback (e) {
    console.log('UNEXPECTED SQLitePlugin ERROR: ' + e)
  }

  let pouchDBOptions = <any>{};
  if (window['isCordovaApp'] && window['sqliteStorageFile'] && !window['turnOffAppLevelEncryption']) {
    pouchDBOptions = {
      view_adapter: 'cordova-sqlite',
      location: 'default',
      androidDatabaseImplementation: 2
    };
    if (key) {
      pouchDBOptions.key = key
    }
  }
  // Adding changes_batch_size here so it can be accessed by PWA for testing.
  if (window['changes_batch_size'] && name === 'shared-user-database') {
    pouchDBOptions.changes_batch_size = window['changes_batch_size']
  }
  let pouch;

  try {
    pouch = new PouchDB(name, pouchDBOptions);
    pouch.crypto("example password horse battery etc") // FIXME obviously don't do this ever
    return pouch
  } catch (e) {
    console.log("Database error: " + e);
    console.trace();
  }
}
