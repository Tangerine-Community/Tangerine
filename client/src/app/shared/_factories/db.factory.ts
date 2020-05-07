// @ts-ignore
import PouchDB from 'pouchdb';
// @ts-ignore
import PouchDBFind from 'pouchdb-find';
import * as cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
import * as PouchDBUpsert from 'pouchdb-upsert';
import debugPouch from 'pouchdb-debug';
PouchDB.plugin(debugPouch);
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBUpsert);
PouchDB.plugin(cordovaSqlitePlugin);
PouchDB.plugin(window['PouchReplicationStream'].plugin);
PouchDB.adapter('writableStream', window['PouchReplicationStream'].adapters.writableStream);
PouchDB.defaults({auto_compaction: true, revs_limit: 1});
declare const cordova: any;
// SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE
// ref: https://www.sqlite.org/c3ref/open.html
const OPEN_DATABASE_FLAGS = 6

export function DB(name, key = ''):PouchDB {

  function openCallback (connectionId) {
    console.log('open connection id: ' + connectionId)
  }

  function errorCallback (e) {
    console.log('UNEXPECTED SQLitePlugin ERROR: ' + e)
  }

  function openFileDatabaseConnection (name, key, openCallback, errorCallback) {
    window['sqliteStorageFile'].resolveAbsolutePath(
      {name: name, location: 2},
      function (path) {
        console.log('database file path: ' + path)
        if (key !== null) {
          window['sqliteBatchConnection'].openDatabaseConnection(
            { path: path, flags: OPEN_DATABASE_FLAGS, key: key }, openCallback, errorCallback
          )
        } else {
          window['sqliteBatchConnection'].openDatabaseConnection(
            { path: path, flags: OPEN_DATABASE_FLAGS }, openCallback, errorCallback
          )
        }

      }
    )
  }

  let options = <any>{};
  if (window['isCordovaApp'] && window['sqlitePlugin'] && !localStorage.getItem('ran-update-v3.8.0')) {
    options = {
      adapter: 'cordova-sqlite',
      location: 'default',
      androidDatabaseImplementation: 2
    };
    if (key) {
      // window['sqlitePlugin'].openDatabase({name, key, location: 'default', androidDatabaseImplementation: 2});
      // openFileDatabaseConnection(name, key, openCallback, errorCallback);
      options.key = key
    } else {
      // window['sqlitePlugin'].openDatabase({name, location: 'default', androidDatabaseImplementation: 2});
      // openFileDatabaseConnection(name, null, openCallback, errorCallback);
    }
  }
  return new PouchDB(name, options);
}


