
import {from as observableFrom,  Observable } from 'rxjs';

import {filter, map} from 'rxjs/operators';


import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
// bcrypt issue https://github.com/dcodeIO/bcrypt.js/issues/71
import * as bcrypt from 'bcryptjs';

//import { uuid as Uuid } from 'js-uuid';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBUpsert)
PouchDB.defaults({auto_compaction: true, revs_limit: 1})
import { TangyFormService } from '../../tangy-forms/tangy-form-service';
import { updates } from '../../core/update/update/updates';
import { AppConfigService } from './app-config.service';

export class StartSyncSessionResponse {
  doc_ids:string
  syncUrl:string
}

export class SyncDetails {
  remoteDb:PouchDB
  localDb:PouchDB
  doc_ids:Array<string>
}
export class ReplicationStatus {
  pulled:number
  pushed:number
  conflicts:Array<string>
}

@Injectable()
export class UserService {

  _views = {}
  userData = {};
  usersDb = new PouchDB('users');
  userDatabases:Array<PouchDB> = []
  LOGGED_IN_USER_DATABASE_NAME = 'currentUser';
  PouchDB = PouchDB

  constructor(
    private appConfigService: AppConfigService,
    private http: HttpClient
  ) { }

  async initialize() {
    for (const user of await this.getAllUsers()) {
      this.userDatabases.push(PouchDB(user.username))
    }
  }

  async createUserDatabase(username) {
    const userDb = PouchDB(username)
    this.installViews(userDb)
    this.userDatabases.push(userDb)
    return userDb
  }

  async create(payload) {
    const userUUID = this.getUuid(); 
    const hashedPassword = await this.hashValue(payload.password);
    this.userData = payload;
    this.userData['userUUID'] = userUUID;
    this.userData['password'] = hashedPassword;
    this.userData['securityQuestionResponse'] = this.userData['hashSecurityQuestionResponse'] 
      ? await this.hashValue(payload.securityQuestionResponse)
      : this.userData['securityQuestionResponse'];
    try {
      const postUserdata = await this.usersDb.post({
        _id: this.userData['username'],
        ...this.userData
      });
      const userDb = await this.createUserDatabase(this.userData['username']);
      if (postUserdata) {
        const result = await this.initUserProfile(this.userData['username'], userUUID);
        // @TODO It might be more appropriate to store the atUpdateIndex in the user's account doc in this.usersDb.
        await userDb.put({
          _id: 'info',
          atUpdateIndex: updates.length - 1
        });
        return result;
      }
    } catch (error) {
      console.error(error);
    }
  }


  async initUserProfile(userDBPath, profileId) {
    if (userDBPath) {
      const userDB = new PouchDB(userDBPath);
      try {
        const result = await userDB.put({
          _id: profileId,
          collection: 'user-profile'
        });
        return result;
      } catch (error) {
        console.error(error);
      }
    }
  }
  async getUserAccount(username?: string) {
    return await this.usersDb.get(username)
  }

  async getUserProfile(username?: string) {
    const userAccount = await this.usersDb.get(username)
    const databaseName = username || await this.getUserDatabase()
    const db = this.getUserDatabase(databaseName)
    const userProfileDoc = await db.get(userAccount.userUUID)
    return userProfileDoc
  }

  async getUserLocations(username?: string) {
    const userProfile = username ? await this.getUserProfile(username) : await this.getUserProfile();
    return userProfile.inputs.reduce((locationIds, input) => {
      if (input.tagName === 'TANGY-LOCATION' && input.value && input.value.length > 0) { 
        // Collect a unique list of the last entries selected.
        return Array.from(new Set([...locationIds, input.value[input.value.length-1].value]).values())
      } else {
        return locationIds
      }
    }, [])
  }

  async doesUserExist(username) {
    let userExists: boolean;
    if (username) {
      /**
       * @TODO We may want to run this on the first time when the app runs.
       */
      this.usersDb.createIndex({
        index: { fields: ['username'] }
      })
      .then(data => console.log('Indexing Succesful'))
      .catch(err => console.error(err));

      try {
        const result = await this.usersDb.find({ selector: { username } })
        if (result.docs.length > 0) {
          userExists = true;
        } else { userExists = false; }
      } catch (error) {
        userExists = true;
        console.error(error);
      }
    } else {
      userExists = true;
      return userExists;
    }
    return userExists;
  }

  async getAllUsers() {
    try {
      const result = await this.usersDb.allDocs({ include_docs: true });
      const users = [];
      observableFrom(result.rows).pipe(map(doc => doc),filter(doc => !doc['id'].startsWith('_design')),).subscribe(doc => {
        users.push({
          username: doc['doc'].username
        });
      });
      return users;
    } catch (error) {
      console.error(error);
    }
  }

  async getUsernames() {
    const response = await this.getAllUsers();
    return response
      .filter(user => user.hasOwnProperty('username'))
      .map(user => user.username);
  }


  async changeUserPassword(user) {
    const password = await this.hashValue(user.newPassword);
    try {
      const result = await this.usersDb.find({ selector: { username: user.username } });
      if (result.docs.length > 0) {
        return await this.usersDb.upsert(result.docs[0]._id, (doc) => {
          doc.password = password;
          return doc;
        });
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async hashValue(value) {
    // Bcrypt issue https://github.com/dcodeIO/bcrypt.js/issues/71j
    //const salt = bcrypt.genSaltSync(10);
    //return bcrypt.hashSync(value, salt);
    return value
  }

  // @TODO Refactor usage of this to use the UserService.db singleton.
  async setUserDatabase(username) {
    return await localStorage.setItem(this.LOGGED_IN_USER_DATABASE_NAME, username);
  }

  getUserDatabase(username = '') {
    if (username === '') {
      console.warn('Detected deprecated usage of UserService.getUserDatabase().')
      return new Promise((resolve, reject) => {
        resolve(localStorage.getItem(this.LOGGED_IN_USER_DATABASE_NAME))
      })
    } else {
      return this.userDatabases.find(userDatabase => userDatabase.name === username)
    }
  }

  async remove(username = '') {
    if (username === '') {
      console.warn('Detected deprecated usage of UserService.removeUserDatabase().')
      return new Promise((resolve, reject) => {
        localStorage.removeItem(this.LOGGED_IN_USER_DATABASE_NAME);
        resolve()
      })
    } else {
      const userDb = this.userDatabases.find(userDatabase => userDatabase.name === username)
      await userDb.destroy()
      const accountDoc = await this.usersDb.get(username)
      await this.usersDb.remove(accountDoc)
    }
  }

  // In a Module's constructor, they have the opportunity to use this method to queue views for installation
  // in User databases.
  // Inspired by https://stackoverflow.com/questions/52263603/angular-add-a-multi-provider-from-lazy-feature-module
  addViews(moduleName, views) {
    this._views[moduleName] = views
  }

  // During account creation, this method is to be used.
  async installViews(userDb) {
    console.log('Installing views...')
    console.log(this._views)
    for (const moduleName in this._views) {
      await userDb.put({
        _id: `_design/${moduleName}`,
        views: this._views[moduleName]
      })
    }
  }

  // A helper method for upgrades to be used when a module has a view to upgrade.
  async updateAllUserViews() {
    console.log('Installing views...')
    for (const userDb of this.userDatabases) {
      for (const moduleName in this._views) {
        const ddoc_id = `_design/${moduleName}`
        try {
          const designDoc = await userDb.get(ddoc_id)
          await userDb.put({
            _id: ddoc_id,
            _rev: designDoc._rev,
            views: this._views[moduleName]
          })
        } catch(err) {
          await userDb.put({
            _id: ddoc_id,
            views: this._views[moduleName]
          })
        }
      }
      await userDb.viewCleanup()
    }
  }

  // A helper method for upgrades to be used when a module has upgraded a view and now views need indexing.
  async indexAllUserViews() {
    try {
      for (const userDb of this.userDatabases) {
        for (const moduleName in this._views) {
          for (const viewName in this._views[moduleName]) {
            await userDb.query(`${moduleName}/${viewName}`)
          }
        }
      }
    } catch(err) {
      throw(err)
    }
  }

  // Example from https://gist.github.com/vbfox/1987edc194626c12d9c0dc31da084744
  getUuid() {

    function getRandomFromMathRandom() {
      const result = new Array(16);

      let r = 0;
      for (let i = 0; i < 16; i++) {
          if ((i & 0x03) === 0) {
              r = Math.random() * 0x100000000;
          }
          result[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }

      return result as ArrayLike<number>;
    }

    function getRandomFunction() {
        // tslint:disable-next-line:no-string-literal
        const browserCrypto = window.crypto || (window["msCrypto"] as Crypto);
        if (browserCrypto && browserCrypto.getRandomValues) {
            // WHATWG crypto-based RNG - http://wiki.whatwg.org/wiki/Crypto
            //
            // Moderately fast, high quality
            try {
            return function getRandomFromCryptoRandom() {
                const result = new Uint8Array(16);
                browserCrypto.getRandomValues(result);
                return result as any;
            };
          } catch (e) { /* fallback*/ }
        }

        // Math.random()-based (RNG)
        //
        // If all else fails, use Math.random().  It's fast, but is of unspecified
        // quality.
        return getRandomFromMathRandom;
    }

    const getRandom = getRandomFunction();

    class ByteHexMappings {
        byteToHex: string[] = [];
        hexToByte: { [hex: string]: number; } = {};
        constructor() {
            for (let i = 0; i < 256; i++) {
                this.byteToHex[i] = (i + 0x100).toString(16).substr(1);
                this.hexToByte[this.byteToHex[i]] = i;
            }
        }
    }

    const byteHexMappings = new ByteHexMappings();

    function getUuidV4() {
        const result = getRandom();

        // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
        result[6] = (result[6] & 0x0f) | 0x40;
        result[8] = (result[8] & 0x3f) | 0x80;

        return result;
    }

    function uuidToString(buf: ArrayLike<number>, offset: number = 0) {
        let i = offset;
        const bth = byteHexMappings.byteToHex;
        return  bth[buf[i++]] + bth[buf[i++]] +
                bth[buf[i++]] + bth[buf[i++]] + "-" +
                bth[buf[i++]] + bth[buf[i++]] + "-" +
                bth[buf[i++]] + bth[buf[i++]] + "-" +
                bth[buf[i++]] + bth[buf[i++]] + "-" +
                bth[buf[i++]] + bth[buf[i++]] +
                bth[buf[i++]] + bth[buf[i++]] +
                bth[buf[i++]] + bth[buf[i++]];
    }

    function getUuidV4String() {
        return uuidToString(getUuidV4());
    }


    return getUuidV4String()
  }

  async sync(username:string):Promise<ReplicationStatus> {
      const syncDetails = await this.syncSetup(username)
      const pullReplicationStatus = await this.replicate(syncDetails.remoteDb, syncDetails.localDb, {doc_ids: syncDetails.doc_ids}) 
      const pushReplicationStatus = await this.replicate(syncDetails.localDb, syncDetails.remoteDb)
      const conflictsQuery = await syncDetails.localDb.query('shared/conflicts');
      return <ReplicationStatus>{
        pulled: pullReplicationStatus.pulled,
        pushed: pushReplicationStatus.pushed,
        conflicts: conflictsQuery.rows.map(row => row.id)
      }
  }

  async syncSetup(username):Promise<SyncDetails> {
    const appConfig = await this.appConfigService.getAppConfig();
    let profileDoc = await this.getUserProfile(username)
    let params = new HttpParams()
    params.set('profileId', profileDoc._id)
    params.set('groupId', appConfig.groupName)
    const response = await this.http.get(`${appConfig.serverUrl}/api/start-sync-session`, { params }).toPromise()
    const localDb = new PouchDB(username);
    const remoteDb = new PouchDB(response['syncUrl']);
    const doc_ids:Array<string> = response['doc_ids']
    return <SyncDetails>{localDb, remoteDb, doc_ids}
  }

  replicate(sourceDb:PouchDB, targetDb:PouchDB, options = {}):Promise<ReplicationStatus> {
    return new Promise((resolve, reject) => {
      sourceDb.replicate.to(targetDb, options).on('complete', function (info) {
        resolve(<ReplicationStatus>{
          pulled: info.docs_written,
          pushed: 0,
          conflicts: info.doc_write_failures
        })
      }).on('error', function (errorMessage) {
        console.log("boo, something went wrong! error: " + errorMessage)
        reject(errorMessage)
      });
    })
  }
}
