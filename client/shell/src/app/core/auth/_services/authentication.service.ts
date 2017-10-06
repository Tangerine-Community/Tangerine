import 'rxjs/add/observable/pairs';

import { Injectable } from '@angular/core';
import * as bcrypt from 'bcryptjs';
import PouchDB from 'pouchdb';
import { Subject } from 'rxjs/Subject';

import { environment } from './../../../../environments/environment';
import { UserService } from './user.service';

@Injectable()
export class AuthenticationService {
  DB = new PouchDB('users');
  public currentUserLoggedIn$: any;
  private _currentUserLoggedIn: boolean;

  constructor(private userService: UserService) {
    this.currentUserLoggedIn$ = new Subject();
  }

  async login(username: string, password: string) {
    let isCredentialsValid = false;
    const userExists = await this.userService.doesUserExist(username);
    if (userExists) {
      console.log('user exists');
      /**
       *@TODO if Security policy require password is false, then no need to check password. Just login the user
       */
      isCredentialsValid = await this.confirmPassword(username, password);
      if (isCredentialsValid) {
        localStorage.setItem('currentUser', username);
        this._currentUserLoggedIn = true;
        this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
      }
    }

    return isCredentialsValid;
  }

  async confirmPassword(username, password) {
    let doesPasswordMatch = false;
    try {
      const result = await this.DB.find({ selector: { username } });
      if (result.docs.length > 0) {
        doesPasswordMatch = await bcrypt.compare(password, result.docs[0].password);
        if (doesPasswordMatch) {
          /**
           * @TODO we will probably need to save the current timestamp when the user logged in for security policy use
           * Security policy Example: 1) Expire user after 5 minutes or 2) never
           * @TODO Refactor for Redux send Action to Current User store. Dont do this until our ngrx stores are backed up by local storage
           */

        }
      }
    } catch (error) {
      console.log(error);
    }
    return doesPasswordMatch;
  };

  logout(): void {
    localStorage.removeItem('currentUser');
    this._currentUserLoggedIn = false;
    this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
  }

  isLoggedIn() {
    this._currentUserLoggedIn = false;
    this._currentUserLoggedIn = !!localStorage.getItem('currentUser');
    this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
    return this._currentUserLoggedIn;

  }
  isLoggedInForUpload(): boolean {
    if (localStorage.getItem('loggedInForUploadUser')) {
      return true;
    }
    return false;
  }
  async loginForUpload(username: string, password: string) {
    const uploadUser = environment.uploadUserCredentials;
    let isCredentialsValid = false;
    if (username === uploadUser.username && password === uploadUser.password) {
      isCredentialsValid = true;
      localStorage.setItem('loggedInForUploadUser', username);
    }
    return isCredentialsValid;
  }


  getSecurityPolicy() {
    return environment.securityPolicy;
  }
  isNoPasswordMode() {
    const isNoPasswordMode = this.getSecurityPolicy().find(policy => policy === 'noPassword');
    return isNoPasswordMode === 'noPassword';
  }



}
