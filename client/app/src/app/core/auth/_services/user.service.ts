
import {from as observableFrom,  Observable } from 'rxjs';

import {filter, map} from 'rxjs/operators';


import { Injectable } from '@angular/core';
// bcrypt issue https://github.com/dcodeIO/bcrypt.js/issues/71
import * as bcrypt from 'bcryptjs';

//import { uuid as Uuid } from 'js-uuid';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import * as PouchDBUpsert from 'pouchdb-upsert';
import { TangyFormService } from '../../../tangy-forms/tangy-form-service';
import { updates } from '../../update/update/updates';

@Injectable()
export class UserService {
  userData = {};
  DB = new PouchDB('users');
  LOGGED_IN_USER_DATABASE_NAME = 'currentUser';
  //constructor(private uuid: Uuid) { }
  constructor() { }

  async create(payload) {
    //const userUUID = this.uuid.v1();
    const userUUID = this.getUuid(); 
    const hashedPassword = await this.hashValue(payload.password);
    this.userData = payload;
    this.userData['userUUID'] = userUUID;
    this.userData['password'] = hashedPassword;
    this.userData['securityQuestionResponse'] = this.userData['hashSecurityQuestionResponse'] ?
      await this.hashValue(payload.securityQuestionResponse) : this.userData['securityQuestionResponse'];
    try {
      /** @TODO: check if user exists before saving */
      const postUserdata = await this.DB.post(this.userData);
      const userDb = new PouchDB(this.userData['username']);

      if (postUserdata) {
        const result = await this.initUserProfile(this.userData['username'], userUUID);
        const tangyFormService = new TangyFormService({ databaseName: this.userData['username'] });
        await tangyFormService.initialize();
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

  async getUserProfile(username?: string) {
    const databaseName = username || await this.getUserDatabase();
    const tangyFormService = new TangyFormService({ databaseName });
    const results = await tangyFormService.getResponsesByFormId('user-profile');
    return results[0];
  }

  async getUserLocations(username?: string) {
    const userProfile = username ? await this.getUserProfile(username) : await this.getUserProfile();
    return userProfile.inputs.reduce((locationIds, input) => {
      if (input.tagName === 'TANGY-LOCATION') { 
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
      PouchDB.plugin(PouchDBFind);
      /**
       * @TODO We may want to run this on the first time when the app runs.
       */
      this.DB.createIndex({
        index: { fields: ['username'] }
      })
      .then(data => console.log('Indexing Succesful'))
      .catch(err => console.error(err));

      try {
        const result = await this.DB.find({ selector: { username } })
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
      const result = await this.DB.allDocs({ include_docs: true });
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
    PouchDB.plugin(PouchDBUpsert);
    const DB = new PouchDB('users');
    const password = await this.hashValue(user.newPassword);
    try {
      const result = await this.DB.find({ selector: { username: user.username } });
      if (result.docs.length > 0) {
        return await DB.upsert(result.docs[0]._id, (doc) => {
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
  async setUserDatabase(username) {
    return await localStorage.setItem(this.LOGGED_IN_USER_DATABASE_NAME, username);
  }

  async getUserDatabase() {
    return await localStorage.getItem(this.LOGGED_IN_USER_DATABASE_NAME);
  }

  async removeUserDatabase() {
    localStorage.removeItem(this.LOGGED_IN_USER_DATABASE_NAME);
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

}
