import { UserDatabase } from './../_classes/user-database.class';
import {from as observableFrom,  Observable } from 'rxjs';
import {filter, map} from 'rxjs/operators';
import { Injectable, Inject } from '@angular/core';
import PouchDB from 'pouchdb'
PouchDB.defaults({auto_compaction: true, revs_limit: 1})
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
import { updates } from '../../core/update/update/updates';
import { DEFAULT_USER_DOCS } from '../_tokens/default-user-docs.token';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../_classes/app-config.class';

@Injectable()
export class UserService {

  userData = {};
  usersDb = new PouchDB('users');
  userDatabases:Array<UserDatabase> = []
  config: AppConfig

  constructor(
    @Inject(DEFAULT_USER_DOCS) private readonly defaultUserDocs:[any],
    private appConfigService: AppConfigService,
    private http: HttpClient
  ) { }

  async initialize() {
    for (const user of await this.getAllUsers()) {
      this.userDatabases.push(new UserDatabase(user._id, user.userUUID))
    }
    this.config = await this.appConfigService.getAppConfig()
  }

  async install() {
    const sharedUserDatabase = new UserDatabase('shared-user-database', 'install', true)
    await this.installDefaultUserDocs(sharedUserDatabase)
    await sharedUserDatabase.put({
      _id: 'info',
      atUpdateIndex: updates.length - 1
    })
  }

  //
  // User Database 
  //

  async createUserDatabase(username:string, userId:string):Promise<UserDatabase> {
    const userDb = new UserDatabase(username, userId)
    this.installDefaultUserDocs(userDb)
    this.userDatabases.push(userDb)
    return userDb
  }

  async removeUserDatabase(username):Promise<boolean> {
    return true
  }

  // @TODO Refactor usage of this to use the UserService.db singleton.
  // @TODO Still used?
  async setUserDatabase(username) {
    return await localStorage.setItem(CURRENT_USER, username)
  }

  async getUserDatabase(username = '') {
   if (username === '') {
      return new UserDatabase(localStorage.getItem(CURRENT_USER), localStorage.getItem('currentUserId'), this.config.sharedUserDatabase)
    } else {
      const userAccount = await this.getUserAccount(username)
      if (this.config.sharedUserDatabase === true) {
        return new UserDatabase(username, userAccount.userUUID, true)
      }
      if (!this.userDatabases.find(userDatabase => userDatabase.username === username)) {
        this.userDatabases.push(new UserDatabase(username, userAccount.userUUID))
      }
      return this.userDatabases.find(userDatabase => userDatabase.username === username)
    }
  }

  //
  // Database helpers
  //

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

  //
  // Accounts
  //
  
  getCurrentUser():string {
    return localStorage.getItem('currentUser')
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
    let userDb:UserDatabase
    if (this.config.sharedUserDatabase === true) {
      userDb = new UserDatabase(userAccount.userUUID, true)
    } else {
      userDb = await this.createUserDatabase(userAccount.userUUID, userAccount.userUUID)
      await userDb.put({
        _id: 'info',
        atUpdateIndex: updates.length - 1
      })
    }
    await userDb.put(userProfile)
    return userAccount
  }

  async remove(username = '') {
    if (username === '') {
      console.warn('Detected deprecated usage of UserService.removeUserDatabase().')
      return new Promise((resolve, reject) => {
        localStorage.removeItem(CURRENT_USER);
        resolve()
      })
    } else {
      if (!this.config.sharedUserDatabase) {
        const userDb = this.userDatabases.find(userDatabase => userDatabase.username === username)
        await userDb.destroy()
      } else {
        const userDb = new UserDatabase(username, '...', true)
        // @TODO Query by username and remove all docs for that user.
      }
      const accountDoc = await this.getUserAccount(username)
      await this.usersDb.remove(accountDoc)
    }
  }

  async getUserAccount(username?: string):Promise<UserAccount> {
    return <UserAccount>(await this.usersDb.allDocs({include_docs: true}))
      .rows
      .map(row => row.doc)
      .find(doc => doc.username === username)
  }

  async getUserAccountById(userId?: string):Promise<UserAccount> {
    return <UserAccount>(await this.usersDb.allDocs({include_docs: true}))
      .rows
      .map(row => row.doc)
      .find(doc => doc.userUUID === userId)
  }

  async getUserProfile(username?: string) {
    username = username
      ? username
      : localStorage.getItem(CURRENT_USER)
    const userAccount = <UserAccount>await this.getUserAccount(username)
    const userDb = await this.getUserDatabase(username)
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

}
