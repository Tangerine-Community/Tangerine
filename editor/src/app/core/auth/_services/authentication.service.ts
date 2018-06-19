import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { UserService } from './user.service';
import { Subject } from 'rxjs/Subject';
@Injectable()
export class AuthenticationService {
  public currentUserLoggedIn$: any;
  private _currentUserLoggedIn: boolean;
  constructor(private userService: UserService, private httpClient: HttpClient) {
    this.currentUserLoggedIn$ = new Subject();
  }
  async login(username: string, password: string) {
    const result = this.httpClient.post('/login', { username, password });
    result.subscribe(async (data: any) => {
      if (data.status === 200) {
        await localStorage.setItem('token', data.name);
        await localStorage.setItem('user_id', data.name);
        await localStorage.setItem('password', data.statusMessage);
        this._currentUserLoggedIn = true;
        this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
      }
    });
    return await result.toPromise().then((data: any) => data.status === 200);
  }

  async isLoggedIn() {
    this._currentUserLoggedIn = false;
    this._currentUserLoggedIn = !!localStorage.getItem('user_id');
    this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
    return this._currentUserLoggedIn;
  }

  async logout() {
    await localStorage.removeItem('token');
    await localStorage.removeItem('user_id');
    await localStorage.removeItem('password');
    this._currentUserLoggedIn = false;
    this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
  }
}
