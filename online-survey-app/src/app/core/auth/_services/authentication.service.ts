import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';

@Injectable()
export class AuthenticationService {
  public currentUserLoggedIn$: any;
  private _currentUserLoggedIn: boolean;
  constructor(
    private http: HttpClient,
    private appConfigService: AppConfigService
  ) {
    this.currentUserLoggedIn$ = new Subject();
  }

  async surveyLogin(accessCode: string) {
    const appConfig = await this.appConfigService.getAppConfig();
    const groupId = appConfig['groupId'];

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
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user_id');
      sessionStorage.removeItem('password');
      sessionStorage.removeItem('permissions');
      return false;
    }
  }

  async isLoggedIn():Promise<boolean> {
    this._currentUserLoggedIn = false;
    this._currentUserLoggedIn = !!sessionStorage.getItem('user_id');
    this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
    return this._currentUserLoggedIn;
  }

  async logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user_id');
    sessionStorage.removeItem('password');
    sessionStorage.removeItem('permissions');
    document.cookie = "Authorization=;max-age=-1";
    this._currentUserLoggedIn = false;
    this.currentUserLoggedIn$.next(this._currentUserLoggedIn);
  }

  async extendUserSession() {
    const appConfig = await this.appConfigService.getAppConfig();
    const groupId = appConfig['groupId'];
    const accessCode = sessionStorage.getItem('user_id');

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
      console.log(error);
      return false;
    }
  }

  async setTokens(token) {
    const jwtData = jwtDecode(token);
    document.cookie = "Authorization=;max-age=-1";
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user_id', jwtData['username']);
    sessionStorage.setItem('permissions', JSON.stringify(jwtData['permissions']));
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
