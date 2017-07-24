import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/pairs';
import { environment } from './../../../../environments/environment';
import * as PouchDB from 'pouchdb';
import PouchDBFind from 'pouchdb-find';
import * as bcrypt from 'bcryptjs';
import { UserService } from './user.service';
@Injectable()
export class AuthenticationService {
  DB = new PouchDB('users');
  constructor(private userService: UserService) { }

  async login(username: string, password: string) {
    let isCredentialsValid = false;
    const userExists = await this.userService.doesUserExist(username);
    if (userExists) {
      console.log('user exists');
      isCredentialsValid = await this.confirmPassword(username, password);
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
          localStorage.setItem('currentUser', username);
        }
      } else { doesPasswordMatch = false; }
    } catch (error) {
      console.log(error);
    }
    return doesPasswordMatch;
  };

  logout(): void {
    localStorage.removeItem('currentUser');
  }

  isLoggedIn(): boolean {
    if (localStorage.getItem('currentUser')) {
      return true;
    }
    return false;
  }
  isLoggedInForUpload(): boolean {
    return false;
  }
  getSecurityPolicy() {
    return environment.securityPolicy;
  }
}
