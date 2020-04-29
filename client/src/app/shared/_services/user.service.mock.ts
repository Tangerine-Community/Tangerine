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

@Injectable()
export class MockUserService {

  userData = {};
  usersDb = DB('users');
  userDatabases: Array<UserDatabase> = []
  config: AppConfig
  _currentUser = ''
  _initialized = false
  sharedUserDatabase;
  public userLoggedIn$:Subject<UserAccount> = new Subject()
  public userLoggedOut$:Subject<UserAccount> = new Subject()
  public userShouldResetPassword$: any;
  private _userShouldResetPassword: boolean;
  window:any;
  bcrypt = window['dcodeIO'].bcrypt


  constructor(
  ) {
    this.window = window;
  }

  async initialize() {
  }

  async installSharedUserDatabase(device) {
  }

  async uninstall() {
  }

  //
  // User Database
  //

  async createUserDatabase(username:string, userId:string):Promise<UserDatabase> {
    return DB('test')
  }

  async getUserDatabase(username = ''):Promise<UserDatabase> {
    return DB('test')

  }

  getUsersDatabase() {
    return DB('test-users') 
  }

  //
  // Database helpers
  //

  // During account creation, this method is to be used.
  async installDefaultUserDocs(userDb) {

  }

  async updateDefaultUserDocs(accountId) {

  }

  async updateAllDefaultUserDocs() {

  }

  async indexUserViews(accountId) {

  }

  async indexAllUserViews() {

  }

  async getUserLocations(username?: string) {
    return ['location1', 'location2']
  }


}
