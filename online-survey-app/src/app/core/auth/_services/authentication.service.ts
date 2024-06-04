import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { Subject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';

@Injectable()
export class AuthenticationService {
  public currentUserLoggedIn$: any;
  private _currentUserLoggedIn: boolean;
  constructor(private userService: UserService, private http: HttpClient, private errorHandler: TangyErrorHandler) {
    this.currentUserLoggedIn$ = new Subject();
  }

  async login(username: string, password: string) {
    try {
      const data = await this.http.post('/login', {username, password}, {observe: 'response'}).toPromise();
      if (data.status === 200) {
        const token = data.body['data']['token'];
        await this.setTokens(token);
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

  async surveyLogin(groupId: string, accessCode: string) {
    try {
      const data = await this.http.post(`/onlineSurvey/login/${groupId}/${accessCode}`, {groupId, accessCode}, {observe: 'response'}).toPromise();
      if (data.status === 200) {
        const token = data.body['data']['token'];
        await this.setTokens(token);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error(error);
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('password');
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

  async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('password');
    localStorage.removeItem('permissions');
    document.cookie = "Authorization=;max-age=-1";
    this._currentUserLoggedIn = false;
    this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
  }

  async setTokens(token) {
    const jwtData = jwtDecode(token);
    document.cookie = "Authorization=;max-age=-1";
    localStorage.setItem('token', token);
    localStorage.setItem('user_id', jwtData['accessCode']);
    localStorage.setItem('permissions', JSON.stringify(jwtData['permissions']));
    document.cookie = `Authorization=${token}`;
  }

  async getCustomLoginMarkup() {
    try {
      return <string>await this.http.get('./assets/custom-login-markup.html', {responseType: 'text'}).toPromise()
    } catch (error) {
      console.error('No custom-login-markup found');
      return '';
    }
  }
}
