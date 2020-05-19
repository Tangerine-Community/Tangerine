import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { Subject } from 'rxjs';
import jwt_decode from 'jwt-decode';
@Injectable()
export class AuthenticationService {
  public currentUserLoggedIn$: any;
  private _currentUserLoggedIn: boolean;
  constructor(private userService: UserService, private http: HttpClient) {
    this.currentUserLoggedIn$ = new Subject();
  }
  async login(username: string, password: string) {
    try {
     const data = await this.http.post('/login', {username, password}, {observe: 'response'}).toPromise();
      if (data.status === 200) {
        const token = data.body['data']['token'];
        const jwtData = jwt_decode(token);
        document.cookie = `Authorization=${token}`
        localStorage.setItem('token', token);
        localStorage.setItem('user_id', jwtData.username);
        localStorage.setItem('permissions', JSON.stringify(jwtData.permissions));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('permissions');
      return false;
    }
  }
  async isLoggedIn():Promise<boolean> {
    this._currentUserLoggedIn = false;
    this._currentUserLoggedIn = !!localStorage.getItem('user_id');
    this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
    return this._currentUserLoggedIn;
  }

  async validateSession():Promise<boolean> {
    const status = await this.http.get(`/login/validate/${localStorage.getItem('user_id')}`).toPromise()
    return status['valid']
  }


  async logout() {
    await localStorage.removeItem('token');
    await localStorage.removeItem('user_id');
    await localStorage.removeItem('password');
    localStorage.removeItem('permissions');
    document.cookie = "Authorization=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    this._currentUserLoggedIn = false;
    this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
  }

  async extendUserSession() {
    const username = localStorage.getItem('user_id');
    try {
      const data = await this.http.post('/extendSession', {username}, {observe: 'response'}).toPromise();
      if (data.status === 200) {
        const token = data.body['data']['token'];
        const jwtData = jwt_decode(token);
        document.cookie = `Authorization=${token}`
        localStorage.setItem('token', token);
        localStorage.setItem('user_id', jwtData.username);
        localStorage.setItem('permissions', JSON.stringify(jwtData.permissions));
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  }
}
