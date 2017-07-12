import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/pairs';
import { environment } from './../../../../environments/environment';

@Injectable()
export class AuthenticationService {

  constructor() { }
  login(username: string, password: string) {
    const user = { username };
    return Observable.pairs(user);
  }
  logout(): void {
    // localStorage.removeItem('currentUser');
  }

  isLoggedIn(): boolean {
    return false;
  }
  isLoggedInForUpload(): boolean {
    return false;
  }
  getSecurityPolicy() {
    return environment.securityPolicy;
  }
}
