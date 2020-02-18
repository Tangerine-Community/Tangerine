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

@Injectable()
export class UserService {

  userData = {};
  usersDb = DB('users');
  userDatabases:Array<UserDatabase> = []
  config: AppConfig
  _currentUser = ''
  _initialized = false
  public userLoggedIn$:Subject<UserAccount> = new Subject()
  public userLoggedOut$:Subject<UserAccount> = new Subject()
  public userShouldResetPassword$: any;
  private _userShouldResetPassword: boolean;
  window:any;
  bcrypt = window['dcodeIO'].bcrypt


  constructor(
    @Inject(DEFAULT_USER_DOCS) private readonly defaultUserDocs:[any],
    private lockBoxService:LockBoxService,
    private appConfigService: AppConfigService
  ) {
    this.window = window;
  }

  async initialize() {
    this.config = await this.appConfigService.getAppConfig()
  }

  async installSharedUserDatabase(device) {
    const sharedUserDatabase = new UserDatabase('shared-user-database', 'install', device.key, device._id, true)
    await this.installDefaultUserDocs(sharedUserDatabase)
    await sharedUserDatabase.put({
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
    this.userDatabases.push(userDb)
    return userDb
  }

  async getUserDatabase(username = '') {
    const userAccount = username === ''
      ? await this.getUserAccount(this.getCurrentUser())
      : await this.getUserAccount(username)
    const appConfig = await this.appConfigService.getAppConfig()
    if (appConfig.syncProtocol === '2') {
      const device = await this.getDevice()
      return new UserDatabase(username, userAccount.userUUID, device.key, device._id, true)
    } else {
      return new UserDatabase(username, userAccount.userUUID, '', '', false)
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
        await userDb.put(doc)
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

  async create(userSignup:UserSignup):Promise<UserAccount> {
    let userAccount:UserAccount
    if (this.config.syncProtocol === '2') {
      // Open the admin's lockBox, copy it, and stash it in the new user's lockBox.
      await this.lockBoxService.openLockBox('admin', userSignup.adminPassword)
      const adminLockBox = this.lockBoxService.getOpenLockBox('admin')
      this.lockBoxService.closeLockBox('admin')
      const userLockBoxContents = <LockBoxContents>{...adminLockBox.contents}
      await this.lockBoxService.fillLockBox(userSignup.username, userSignup.password, userLockBoxContents)
      const device = adminLockBox.contents.device
      const userProfile = new TangyFormResponseModel({form:{id:'user-profile'}})
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
        password: this.hashValue(userSignup.password),
        securityQuestionResponse: this.hashValue(userSignup.securityQuestionResponse),
        userUUID: userProfile._id,
        initialProfileComplete: false
      })
      await this.usersDb.post(userAccount)
      const userDb = await this.createUserDatabase(userAccount.username, userAccount.userUUID)
      await userDb.put({
        _id: 'info',
        atUpdateIndex: updates.length - 1
      })
      await userDb.put(userProfile)
    }
    return userAccount
  }

  async getUserAccount(username?: string):Promise<UserAccount> {
    const userAccountData = <any>(await this.usersDb.allDocs({include_docs: true}))
      .rows
      .map(row => row.doc)
      .find(doc => doc.username === username)
    return new UserAccount(userAccountData)
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

  async changeUserPassword(user, devicePassword = '') {
    const userDoc = await this.usersDb.get(user.username)
    const password = this.hashValue(user.newPassword)
    const keyBox = devicePassword
        ? CryptoJS.AES.encrypt(user.newPassword, devicePassword).toString()
        : CryptoJS.AES.encrypt(user.newPassword, user.newPassword).toString()
    await this.usersDb.put({
      ...userDoc,
      password,
      keyBox
    })
    return true
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
      // Make the user's database available for code in forms to use.
      window['userDb'] = await this.getUserDatabase(username)
      const userAccount = await this.getUserAccount(username)
      this.setCurrentUser(userAccount.username)
      this.userLoggedIn$.next(userAccount)
      return true
    } else {;
      return false
    }
  }

  async resetPassword(user, devicePassword) {
    const userExists = await this.doesUserExist(user.username);
    const doesAnswerMatch = await this.confirmSecurityQuestion(user);
    if (
      userExists &&
      doesAnswerMatch &&
      (await this.changeUserPassword(user, devicePassword))
    ) {
      this.login(user.username, user.password)
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
  }

  isLoggedIn() {
    return this.getCurrentUser() ? true : false
  }

  getCurrentUser():string {
    return window.location.hostname === 'localhost'
      ? localStorage.getItem('currentUser')
      : this._currentUser
  }

  setCurrentUser(username):string {
    if (window.location.hostname === 'localhost') {
      localStorage.setItem('currentUser', username)
    } else {
      this._currentUser = username
    }
    return username
  }

}
