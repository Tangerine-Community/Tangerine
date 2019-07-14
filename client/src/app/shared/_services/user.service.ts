
import {from as observableFrom,  Observable } from 'rxjs';

import {filter, map} from 'rxjs/operators';


import { Injectable, Inject } from '@angular/core';
// bcrypt issue https://github.com/dcodeIO/bcrypt.js/issues/71
//import * as bcrypt from 'bcryptjs';
const bcrypt = {
  hashSync: (value) => value
}
const CURRENT_USER = 'currentUser'
import { AppConfigService } from './app-config.service';
import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model.js';
import { UserAccount } from '../_classes/user-account.class';
import { UserSignup } from '../_classes/user-signup.class';


//import { uuid as Uuid } from 'js-uuid';
import PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import * as PouchDBUpsert from 'pouchdb-upsert';
PouchDB.plugin(PouchDBFind)
PouchDB.plugin(PouchDBUpsert)
PouchDB.defaults({auto_compaction: true, revs_limit: 1})
import { TangyFormService } from '../../tangy-forms/tangy-form-service';
import { updates } from '../../core/update/update/updates';
import { DEFAULT_USER_DOCS } from '../_tokens/default-user-docs.token';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class UserService {

  userData = {};
  usersDb = new PouchDB('users');
  userDatabases:Array<PouchDB> = []
  PouchDB = PouchDB

  constructor(
    @Inject(DEFAULT_USER_DOCS) private readonly defaultUserDocs:[any],
    private appConfigService: AppConfigService,
    private http: HttpClient
  ) { }

  async initialize() {
    for (const user of await this.getAllUsers()) {
      this.userDatabases.push(PouchDB(user.username))
    }
  }

  getCurrentUser():string {
    return localStorage.getItem('currentUser')
  }

  getUserDbName(): string {
    // KW
    // This is for future expansion
    // Currently it just returns the user name but
    // it will be updated to return a configurable db name
    return localStorage.getItem('currentUser')
  }

  async createUserDatabase(username):Promise<PouchDB> {
    const userDb = PouchDB(username)
    this.installDefaultUserDocs(userDb)
    this.userDatabases.push(userDb)
    return userDb
  }

  async create(userSignup:UserSignup):Promise<UserAccount> {
    const userProfile = new TangyFormResponseModel({form:{id:'user-profile'}})
    const userAccount = new UserAccount(
      userSignup.username,
      this.hashValue(userSignup.password),
      userSignup.securityQuestionResponse,
      userProfile._id
    ) 
    await this.usersDb.post(userAccount)
    const userDb = await this.createUserDatabase(userAccount._id);
    await userDb.put(userProfile)
    // @TODO It might be more appropriate to store the atUpdateIndex in the user's account doc in this.usersDb.
    await userDb.put({
      _id: 'info',
      atUpdateIndex: updates.length - 1
    })
    return userAccount
  }

  async getUserAccount(username?: string):Promise<UserAccount> {
    return <UserAccount>(await this.usersDb.allDocs({include_docs: true}))
      .rows
      .map(row => row.doc)
      .find(doc => doc.username === username)
  }

  async getUserProfile(username?: string) {
    username = username
      ? username
      : localStorage.getItem(CURRENT_USER)
    const userAccount = <UserAccount>await this.getUserAccount(username)
    const databaseName = username || await this.getUserDatabase()
    const userDb = this.getUserDatabase(databaseName)
    const userProfile = new TangyFormResponseModel(await userDb.get(userAccount.userUUID))
    return userProfile
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

  async doesUserExist(username):Promise<boolean> {
    return (await this.usersDb.allDocs({include_docs:true}))
      .rows
      .map(row => row.doc.username)
      .includes(username)
  }

  async getAllUsers() {
    return ((await this.usersDb.allDocs({ include_docs: true }))
      .rows
      .map(row => row.doc)
      .filter(doc => !doc['_id'].includes('_design')))
  }

  async getUsernames() {
    const response = await this.getAllUsers();
    return response
      .filter(user => user.hasOwnProperty('username'))
      .map(user => user.username);
  }


  async changeUserPassword(user) {
    const password = this.hashValue(user.newPassword);
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

  hashValue(value) {
    // Bcrypt issue https://github.com/dcodeIO/bcrypt.js/issues/71j
    //const salt = bcrypt.genSaltSync(10);
    //return bcrypt.hashSync(value, salt);
    return bcrypt.hashSync(value)
  }

  // @TODO Refactor usage of this to use the UserService.db singleton.
  async setUserDatabase(username) {
    return await localStorage.setItem(CURRENT_USER, username);
  }

  getUserDatabase(username = '') {
    if (username === '') {
      console.warn('Detected deprecated usage of UserService.getUserDatabase().')
      return new Promise((resolve, reject) => {
        resolve(localStorage.getItem(CURRENT_USER))
      })
    } else {
      if (!this.userDatabases.find(userDatabase => userDatabase.name === username)) {
        this.userDatabases.push(new PouchDB(username))
      }
      return this.userDatabases.find(userDatabase => userDatabase.name === username)
    }
  }

  async remove(username = '') {
    if (username === '') {
      console.warn('Detected deprecated usage of UserService.removeUserDatabase().')
      return new Promise((resolve, reject) => {
        localStorage.removeItem(CURRENT_USER);
        resolve()
      })
    } else {
      const userDb = this.userDatabases.find(userDatabase => userDatabase.name === username)
      await userDb.destroy()
      const accountDoc = await this.getUserAccount(username)
      await this.usersDb.remove(accountDoc)
    }
  }

  // During account creation, this method is to be used.
  async installDefaultUserDocs(userDb) {
    console.log('Installing default user docs...')
    for (const moduleDocs of this.defaultUserDocs) {
      for (const doc of moduleDocs) {
        await userDb.put(doc)
      }
    }
  }

  // A helper method for upgrades to be used when a module has a view to upgrade.
  async updateAllDefaultUserDocs() {
    console.log('Installing views...')
    for (const userDb of this.userDatabases) {
      for (const moduleDocs of this.defaultUserDocs) {
        for (const doc of moduleDocs) {
          try {
            const docInDb = await userDb.get(doc._id)
            await userDb.put({
              ...doc,
              _rev: docInDb._rev
            })
          } catch(err) {
            await userDb.put(doc)
          }
        }
      }
    }
  }

  // A helper method for upgrades to be used when a module has upgraded a view and now views need indexing.
  async indexAllUserViews() {
    try {
      for (const userDb of this.userDatabases) {
        for (const moduleDocs of this.defaultUserDocs) {
          for (const doc of moduleDocs) {
            if (Object.keys(doc.views).length > 0) {
              for (let viewName of Object.keys(doc.views)) {
                await userDb.query(`${doc._id.replace('_design/', '')}/${viewName}`)
              }
            }
          }
        }
      }
    } catch(err) {
      throw(err)
    }
  }

}
