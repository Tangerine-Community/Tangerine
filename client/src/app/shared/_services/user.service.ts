import { TangyFormsInfoService } from './../../tangy-forms/tangy-forms-info-service';
import { createSearchIndex } from './create-search-index';
import {HttpClient} from "@angular/common/http";

const SHARED_USER_DATABASE_NAME = 'shared-user-database';
import { DeviceService } from './../../device/services/device.service';
import { Subject } from 'rxjs';
import { Device } from 'src/app/device/classes/device.class';
import { LockBoxService } from './lock-box.service';
import { UserAccount } from './../_classes/user-account.class';
import { UserDatabase } from './../_classes/user-database.class';
import * as CryptoJS from 'crypto-js'
import { Injectable, Inject } from '@angular/core';
import { AppConfigService } from './app-config.service';
import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model.js';
import { UserSignup } from '../_classes/user-signup.class';
import { updates } from '../../core/update/update/updates';
import { DEFAULT_USER_DOCS } from '../_tokens/default-user-docs.token';
import { AppConfig } from '../_classes/app-config.class';
import { LockBoxContents } from '../_classes/lock-box-contents.class';
import { DB } from '../_factories/db.factory';
import {VariableService} from "./variable.service";

export type UserRole = string

@Injectable()
export class UserService {

  userData = {};
  usersDb = DB('users');
  userDatabases: Array<UserDatabase> = []
  config: AppConfig
  _currentUser = ''
  _initialized = false
  profile:TangyFormResponseModel
  roles:Array<string>
  sharedUserDatabase;
  public userLoggedIn$:Subject<UserAccount> = new Subject()
  public userLoggedOut$:Subject<UserAccount> = new Subject()
  public userShouldResetPassword$: any;
  private _userShouldResetPassword: boolean;
  window:any;
  bcrypt = window['dcodeIO'].bcrypt


  constructor(
    @Inject(DEFAULT_USER_DOCS) private readonly defaultUserDocs:[any],
    private lockBoxService:LockBoxService,
    private deviceService:DeviceService,
    private appConfigService: AppConfigService,
    private http: HttpClient,
    private readonly formsInfoService:TangyFormsInfoService,
    private variableService:VariableService
  ) {
    this.window = window;
  }

  async initialize() {
    this.config = await this.appConfigService.getAppConfig()
    if (this.isLoggedIn()) {
      await this.setCurrentUser(this.getCurrentUser())
    }
  }

  async installSharedUserDatabase(device) {
    this.sharedUserDatabase = new UserDatabase('shared-user-database', 'install', device.key, device._id, true)
    const formsInfo = await this.formsInfoService.getFormsInfo()
    await createSearchIndex(this.sharedUserDatabase, formsInfo)
    await this.installDefaultUserDocs(this.sharedUserDatabase)
    // install any extra views
    try {
      let queryJs = await this.http.get('./assets/queries.js', {responseType: 'text'}).toPromise()
        let queries;
        eval(`queries = ${queryJs}`)
        for (const query of queries) {
          let doc = {
            _id: '_design/' + query.id,
            version: query.version,
            views: {
              [query.id]: {
                ...typeof query.view === 'string'? {"map": query.view.toString()}: {
                  ...query.view.map? {"map": query.view.map.toString()}: {},
                  ...query.view.reduce? {"reduce": query.view.reduce.toString()}: {}
                },
              }
            }
          }
          await this.sharedUserDatabase.put(doc)
        }
    } catch (e) {
      console.warn('./assets/queries.js failed to install. Only worry about this if you are using queries.js.')
      console.error(e)
    }
    await this.variableService.set('atUpdateIndex', updates.length - 1);
  }

  async installSharedUserDatabaseOnly(device) {
    this.sharedUserDatabase = new UserDatabase('shared-user-database', 'install', device.key, device._id, true)
    await this.installDefaultUserDocs(this.sharedUserDatabase)
    await this.sharedUserDatabase.put({
      _id: 'info',
      atUpdateIndex: updates.length - 1
    })
  }

  async uninstall() {
    const device = await this.getDevice()
    const userAccounts = await this.getAllUserAccounts()
    for (const userAccount of userAccounts) {
      const userDb = await this.getUserDatabase(userAccount.username)
      await userDb.destroy()
    }
    const sharedUserDatabase = new UserDatabase('shared-user-database', 'install', device.key, 'install', true)
    await sharedUserDatabase.destroy()
    await this.usersDb.destroy()
  }

  //
  // User Database
  //

  async createUserDatabase(username:string, userId:string):Promise<UserDatabase> {
    const device = await this.getDevice()
    const userDb = new UserDatabase(username, userId, device.key, device._id)
    this.installDefaultUserDocs(userDb)
    const formsInfo = await this.formsInfoService.getFormsInfo()
    await createSearchIndex(userDb, formsInfo)
    this.userDatabases.push(userDb)
    return userDb
  }

  async getUserDatabase(username = ''):Promise<UserDatabase> {
    if (username === '' && !this.isLoggedIn()) {
      throw new Error('UserService.getUserDatabase was called but no one is logged in.')
    }
    const userAccount = username === ''
      ? await this.getUserAccount(this.getCurrentUser())
      : await this.getUserAccount(username)
    const appConfig = await this.appConfigService.getAppConfig()
    const deviceInfo = await this.deviceService.getAppInfo()
    if (appConfig.syncProtocol === '2') {
      const device = await this.deviceService.getDevice()
      return new UserDatabase(userAccount.username, userAccount.userUUID, device.key, device._id, true, deviceInfo.buildId, deviceInfo.buildChannel, deviceInfo.groupId, appConfig.attachHistoryToDocs)
    } else {
      const appInfo = await this.deviceService.getAppInfo()
      return new UserDatabase(userAccount.username, userAccount.userUUID, '', '', false, appInfo.buildId, appInfo.buildChannel, appInfo.groupId, appConfig.attachHistoryToDocs)
    }
  }

  getUsersDatabase() {
    return this.usersDb
  }

  //
  // Database helpers
  //

  // During account creation, this method is to be used.
  async installDefaultUserDocs(userDb) {
    console.log('Installing default user docs...')
    for (const moduleDocs of this.defaultUserDocs) {
      for (const doc of moduleDocs) {
        try {
          await userDb.put(doc)
        } catch (e) {
          console.log(e)
        }
      }
    }
  }

  async updateDefaultUserDocs(accountId) {
    console.log(`Updating default user docs for ${accountId}`)
    const userDb = await this.getUserDatabase(accountId)
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

  async updateAllDefaultUserDocs() {
    const userAccounts = await this.getAllUserAccounts()
    for (const userAccount of userAccounts) {
      await this.updateDefaultUserDocs(userAccount._id)
    }
  }

  async indexUserViews(accountId) {
    const userDb = await this.getUserDatabase(accountId)
    try {
      for (const moduleDocs of this.defaultUserDocs) {
        for (const doc of moduleDocs) {
          if (Object.keys(doc.views).length > 0) {
            for (let viewName of Object.keys(doc.views)) {
              await userDb.query(`${doc._id.replace('_design/', '')}/${viewName}`)
            }
          }
        }
      }
    } catch(err) {
      alert('An error occurred updating the database.')
      throw(err)
    }
  }

  async indexAllUserViews() {
    const userAccounts = await this.getAllUserAccounts()
    for (const userAccount of userAccounts) {
      await this.indexUserViews(userAccount._id)
    }
  }

  //
  // Accounts
  //

  async createAdmin(password:string, lockBoxContents:LockBoxContents):Promise<UserAccount> {
    // Open the admin's lockBox, copy it, and stash it in the new user's lockBox.
    const userProfile = new TangyFormResponseModel({form:{id:'user-profile'}})
    userProfile.items = [
      {
        id: 'item1',
        inputs: [
          {
            name: 'roles',
            value: [{name: 'admin', value: 'on'}]
          },
          {
            name: 'first_name',
            value: 'Admin of Device'
          },
          {
            name: 'last_name',
            value: `Device ID: ${lockBoxContents.device._id}`
          },
          {
            name: 'location',
            value: Object
              .getOwnPropertyNames(lockBoxContents.device.assignedLocation)
              .map(propName => { 
                return { 
                  level: propName,
                  value: lockBoxContents.device.assignedLocation[propName]
                }
              })
          }
        ]
      }
    ]
    const userAccount = new UserAccount({
      _id: 'admin',
      password: this.hashValue(password),
      securityQuestionResponse: this.hashValue(password),
      userUUID: userProfile._id,
      initialProfileComplete: true
    })
    await this.usersDb.post(userAccount)
    let userDb = new UserDatabase('admin', userAccount.userUUID, lockBoxContents.device.key, lockBoxContents.device._id, true)
    await userDb.put(userProfile)
    await this.lockBoxService.fillLockBox('admin', password, lockBoxContents)
    return userAccount
  }

  async getDevice():Promise<Device> {
    try {
      const lockBox = this.lockBoxService.getOpenLockBox(this.getCurrentUser())
      return lockBox.contents.device
    } catch (e) {
      return new Device()
    }
  }

  getRoles(username = ''):Array<UserRole> {
    if (this.profile.items[0] && this.profile.items[0].inputs) {
      const rolesInput = this.profile.items[0].inputs.find(input => input.name === 'roles')
      return rolesInput
        ? rolesInput.value.reduce((roles, option) => {
            return option.value === 'on'
              ? [...roles, option.name]
              : roles
          }, [])
        : [] 
    } else {
      return []
    }
  }

  async create(userSignup:UserSignup):Promise<UserAccount> {
    let userAccount:UserAccount
    if (this.config.syncProtocol === '2') {
      // Open the admin's lockBox, copy it, and stash it in the new user's lockBox.
      await this.lockBoxService.openLockBox('admin', userSignup.adminPassword)
      let adminLockBox
      try {
        adminLockBox = this.lockBoxService.getOpenLockBox('admin');
      } catch (e) {
        throw new Error(e)
      }
      this.lockBoxService.closeLockBox('admin')
      const userLockBoxContents = <LockBoxContents>{...adminLockBox.contents}
      await this.lockBoxService.fillLockBox(userSignup.username, userSignup.password, userLockBoxContents)
      const device = adminLockBox.contents.device
      const userProfile = new TangyFormResponseModel({
        form:{
          id:'user-profile'
        },
        items: [
          {
            id: 'item1',
            inputs: [
              {
                name: 'role',
                value: 'dataCollector'
              }
            ]
          }
        ]
      })
      userAccount = new UserAccount({
        _id: userSignup.username,
        password: this.hashValue(userSignup.password),
        securityQuestionResponse: this.hashValue(userSignup.securityQuestionResponse),
        userUUID: userProfile._id,
        initialProfileComplete: false
      })
      await this.usersDb.post(userAccount)
      const userDb = new UserDatabase(userSignup.username, userAccount.userUUID, device.key, device._id, true)
      await userDb.put(userProfile)
    } else {
      const userProfile = new TangyFormResponseModel({form:{id:'user-profile'}})
      userAccount = new UserAccount({
        _id: userSignup.username,
        username: userSignup.username,
        password: this.hashValue(userSignup.password),
        securityQuestionResponse: this.hashValue(userSignup.securityQuestionResponse),
        userUUID: userProfile._id,
        initialProfileComplete: false
      })
      await this.usersDb.post(userAccount)
      const userDb = await this.createUserDatabase(userAccount.username, userAccount.userUUID)
      await this.variableService.set('atUpdateIndex', updates.length - 1);
      await userDb.put(userProfile)
    }
    return userAccount
  }

  async getUserAccount(username?: string):Promise<UserAccount> {
    // || doc._id === username for backwards compatibility during upgrades from v3.1.0.
    const doc = (await this.usersDb.allDocs({include_docs: true}))
      .rows
      .map(row => row.doc)
      .find(doc => doc.username === username || doc._id === username)
    return new UserAccount(doc)
  }

  async saveUserAccount(userAccount:UserAccount):Promise<UserAccount> {
    await this.usersDb.put(userAccount)
    return await this.usersDb.get(userAccount._id)
  }

  async getAllUserAccounts():Promise<Array<UserAccount>> {
    return (await this.usersDb.allDocs({include_docs: true}))
      .rows
      .map(row => <UserAccount>row.doc)
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
      : this.getCurrentUser()
    const userAccount = <UserAccount>await this.getUserAccount(username)
    const userDb = await this.getUserDatabase(username)
    const userProfile = new TangyFormResponseModel(await userDb.get(userAccount.userUUID))
    return userProfile
  }

  async getUserLocation(username?: string) {
    const userProfile = username
      ? await this.getUserProfile(username)
      : await this.getUserProfile();
    return userProfile.inputs.find(input => input.name === 'location')
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

  async changeUserPassword(user, adminPassword) {
    if (this.config.syncProtocol === '2') {
      await this.lockBoxService.openLockBox('admin', adminPassword)
      let adminLockBox
      try {
        adminLockBox = this.lockBoxService.getOpenLockBox('admin');
      } catch (e) {
        throw new Error(e)
      }
      this.lockBoxService.closeLockBox('admin')
      const userLockBoxContents = <LockBoxContents>{...adminLockBox.contents}
      await this.lockBoxService.fillLockBox(user.username, user.password, userLockBoxContents)
      const userAccount = await this.getUserAccount(user.username)
      userAccount.password = this.hashValue(user.password)
      await this.saveUserAccount(<UserAccount>{ ...userAccount, initialProfileComplete:true })
      return true;
    } else {
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
  }

  hashValue(value) {
    const salt = this.bcrypt.genSaltSync(10);
    return this.bcrypt.hashSync(value, salt);
  }

  async login(username: string, password: string) {
    if (await this.doesUserExist(username) && await this.confirmPassword(username, password)) {
      const appConfig = await this.appConfigService.getAppConfig()
      if (appConfig.syncProtocol === '2') {
        await this.lockBoxService.openLockBox(username, password)
      }
      const userAccount = await this.getUserAccount(username)
      await this.setCurrentUser(userAccount.username)
      // Make globals available for form developers.
      window['userDb'] = await this.getUserDatabase(username)
      window['username'] = this.getCurrentUser()
      window['userProfile'] = await this.getUserProfile()
      window['userRoles'] = this.getRoles()
      window['userId'] = window['userProfile']._id
      this.userLoggedIn$.next(userAccount)
      return true
    } else {;
      return false
    }
  }

  async resetPassword(user, adminPassword) {
    const userExists = await this.doesUserExist(user.username);
    const doesAnswerMatch = await this.confirmSecurityQuestion(user);
    if (
      userExists &&
      doesAnswerMatch &&
      (await this.changeUserPassword(user, adminPassword))
    ) {
      await this.login(user.username, user.password)
      return true;
    } else {
      return false;
    }
  }

  async confirmPassword(username, password):Promise<boolean> {
    const userAccount = await this.getUserAccount(username)
    return this.bcrypt.compareSync(password, userAccount.password)
      ? true
      : false
  }

  async confirmSecurityQuestion(user):Promise<boolean> {
    const userAccount = await this.getUserAccount(user.username)
    return this.bcrypt.compareSync(user.securityQuestionResponse, userAccount.securityQuestionResponse)
      ? true
      : false
  }

  async logout() {
    const appConfig = await this.appConfigService.getAppConfig()
    const username = this.getCurrentUser()
    if (window['isCordovaApp'] && appConfig.syncProtocol === '2') {
      await this.lockBoxService.closeLockBox(username)
      try {
        const db = window['sqlitePlugin'].openDatabase({name: 'shared-user-database', location: 'default', androidDatabaseImplementation: 2});
        db.close()
      } catch(e) {
      }
      try {
        const db = window['sqlitePlugin'].openDatabase({name: 'shared-user-database-index', location: 'default', androidDatabaseImplementation: 2});
        db.close()
      } catch(e) {
      }
    }
    this.setCurrentUser('');
    this.getUserAccount(username)
      .then((userAccount) => this.userLoggedOut$.next(userAccount))
    // TODO test on upgrades - pathing may have changed.
    if (window['isCordovaApp'] && appConfig.syncProtocol === '2') {
      window.location.href = window.location.protocol + '//' + window.location.pathname + 'index.html'
    }
  }

  isLoggedIn() {
    return this.getCurrentUser() ? true : false
  }

  /**
   *  if developing locally, pull current user from the cache...
   */
  getCurrentUser():string {
    return window.location.hostname === 'localhost'
      ? localStorage.getItem('currentUser')
      : this._currentUser
  }

  async setCurrentUser(username):Promise<string> {
    // Note: Unless developing locally, we store user session information in memory so we don't for example put the
    // contents of the lockbox in an unencrypted form on disk in localStorage/etc. Putting currentUser in memory
    // guarantees that if we reload the user will be logged out as opposed to being logged in but not having access
    // to the lockbox contents, thus not actually having access to the database.
    if (window.location.hostname === 'localhost') {
      localStorage.setItem('currentUser', username)
    } else {
      this._currentUser = username
    }
    window['currentUser'] = username
    this.profile = await this.getUserProfile()
    this.roles = this.getRoles()
    return username
  }

  async getSharedDBDocCount() {
    const device = await this.getDevice()
    const db = DB(SHARED_USER_DATABASE_NAME, device.key)
    db.info().then(info => console.log(info.doc_count))
  }

}
