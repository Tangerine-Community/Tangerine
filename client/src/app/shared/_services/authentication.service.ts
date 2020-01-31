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
      localStorage.setItem('currentUser', userAccount.username);
      localStorage.setItem('currentUsername', userAccount.username);
      localStorage.setItem('currentUserId', userAccount.userUUID);
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
      localStorage.setItem('currentUser', user.username);
      this._currentUserLoggedIn = true;
      this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
      this.userLoggedIn$.next(user)
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
    const username = localStorage.getItem('currentUser')
    if (window['isCordovaApp'] && appConfig.syncProtocol === '2') {
      await this.lockBoxService.closeLockBox(username)
      const db = window['sqlitePlugin'].openDatabase({name: 'shared-user-database', location: 'default', androidDatabaseImplementation: 2});
      db.close()
    }
    localStorage.removeItem('currentUser');
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

  shouldResetPassword() {
    this._userShouldResetPassword = false;
    this._userShouldResetPassword = !!localStorage.getItem('userShouldResetPassword');
    this.userShouldResetPassword$.next(this._userShouldResetPassword);
    return this._userShouldResetPassword;
  }

  async getSecurityPolicy() {
    const appConfig = await this.appConfigService.getAppConfig();
    return appConfig.securityPolicy;
  }

  async isNoPasswordMode() {
    const policy = await this.getSecurityPolicy();
    const isNoPasswordMode = await policy.find(p => p === 'noPassword');
    return isNoPasswordMode === 'noPassword';
  }

  getCurrentUser() {
    return localStorage.getItem('currentUser');
  }

  getCurrentUserDBPath() {
    return localStorage.getItem('currentUser');
  }
}