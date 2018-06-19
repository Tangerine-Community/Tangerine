import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import 'rxjs/add/operator/toPromise';
import { TangyErrorHandler } from '../../../shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from '../../../shared/_services/translation-marker';
@Injectable()
export class UserService {

  constructor(private httpClient: HttpClient, private errorHandler: TangyErrorHandler) { }

  async createUser(payload) {
    try {
      if (!(await this.doesUserExist(payload.username))) {
        const result = await this.httpClient.post('/users/register-user', payload).toPromise();
        return result;
      }

    } catch (error) {
      console.error(error);
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }

  }

  async doesUserExist(username: string) {
    try {
      const result: any = await this.httpClient.get(`/users/userExists/${username}`).toPromise();
      return result.data;
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async getAllUsers() {
    try {
      const users: any = await this.httpClient.get('/users').toPromise();
      return users.data;
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }
}
