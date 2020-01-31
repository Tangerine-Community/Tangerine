import { LockBoxService } from './lock-box.service';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { UserService } from './user.service';
import { UserAccount } from '../_classes/user-account.class';
const bcrypt = window['dcodeIO'].bcrypt 

@Injectable()
export class AuthenticationService {

  public userLoggedIn$:Subject<UserAccount> = new Subject()
  public userLoggedOut$:Subject<UserAccount> = new Subject()
  public currentUserLoggedIn$: any;
  private _currentUserLoggedIn: boolean;
  public userShouldResetPassword$: any;
  private _userShouldResetPassword: boolean;
  private _currentUser = ''
  window:any

  constructor(
    private userService: UserService,
    private lockBoxService:LockBoxService,
    private appConfigService: AppConfigService
  ) {
    this.window = window
    this.currentUserLoggedIn$ = new Subject();
    this.userShouldResetPassword$ = new Subject();
  }

  async login(username: string, password: string) {
    if (await this.userService.doesUserExist(username) && await this.confirmPassword(username, password)) {
      const appConfig = await this.appConfigService.getAppConfig()
      if (appConfig.syncProtocol === '2') {
        await this.lockBoxService.openLockBox(username, password)
      } 
      // Make the user's database available for code in forms to use.
      this.window.userDb = await this.userService.getUserDatabase(username)
      const userAccount = await this.userService.getUserAccount(username)
      this.setCurrentUser(userAccount.username)
      this._currentUserLoggedIn = true;
      this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
      this.userLoggedIn$.next(userAccount)
      return true 
    } else {;
      return false
    }
  }

  async resetPassword(user, devicePassword) {
    const userExists = await this.userService.doesUserExist(user.username);
    const doesAnswerMatch = await this.confirmSecurityQuestion(user);
    if (
      userExists &&
      doesAnswerMatch &&
      (await this.userService.changeUserPassword(user, devicePassword))
    ) {
      this.login(user.username, user.password)
      return true;
    } else {
      return false;
    }
  }

  async confirmPassword(username, password):Promise<boolean> {
    const userAccount = await this.userService.getUserAccount(username)
    return bcrypt.compareSync(password, userAccount.password)
      ? true
      : false
  }

  async confirmSecurityQuestion(user):Promise<boolean> {
    const userAccount = await this.userService.getUserAccount(user.username)
    return bcrypt.compareSync(user.securityQuestionResponse, userAccount.securityQuestionResponse)
      ? true
      : false
  }

  async logout() {
    const appConfig = await this.appConfigService.getAppConfig()
    const username = this.getCurrentUser()
    if (window['isCordovaApp'] && appConfig.syncProtocol === '2') {
      await this.lockBoxService.closeLockBox(username)
      const db = window['sqlitePlugin'].openDatabase({name: 'shared-user-database', location: 'default', androidDatabaseImplementation: 2});
      db.close()
    }
    this.setCurrentUser('');
    this._currentUserLoggedIn = false;
    this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
    this.userService.getUserAccount(username)
      .then((userAccount) => this.userLoggedOut$.next(userAccount))
  }

  isLoggedIn() {
    this._currentUserLoggedIn = false;
    this._currentUserLoggedIn = !!localStorage.getItem('currentUser');
    this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
    return this._currentUserLoggedIn;
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