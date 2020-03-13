// @ts-ignore
import PouchDB from 'pouchdb';
// @ts-ignore
import PouchDBFind from 'pouchdb-find';
import * as cordovaSqlitePlugin from 'pouchdb-adapter-cordova-sqlite';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBFind);
PouchDB.plugin(PouchDBUpsert);
PouchDB.plugin(cordovaSqlitePlugin);
PouchDB.plugin(window['PouchReplicationStream'].plugin);
PouchDB.adapter('writableStream', window['PouchReplicationStream'].adapters.writableStream);
PouchDB.defaults({auto_compaction: true, revs_limit: 1});

export function DB(name, key = ''):PouchDB {
  let options = <any>{};
  if (window['isCordovaApp'] && window['sqlitePlugin']) {
    // options = {
    //   adapter: 'cordova-sqlite',
    //   location: 'default',
    //   androidDatabaseImplementation: 2
    // };
    options = {
      adapter: 'cordova-sqlite',
      location: 'default'
    };
    // if (key) {
    //   window['sqlitePlugin'].openDatabase({name, key, location: 'default', androidDatabaseImplementation: 2});
    //   options.key = key
    // } else {
    //   window['sqlitePlugin'].openDatabase({name, location: 'default', androidDatabaseImplementation: 2});
    // }
    // window['sqlitePlugin'].openDatabase({name, location: 'default'});
  }
  return new PouchDB(name, options);
}
