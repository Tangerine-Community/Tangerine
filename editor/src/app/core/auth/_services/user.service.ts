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
      this.showError(error);
    }

  }

  async doesUserExist(username: string) {
    try {
      const result: any = await this.httpClient.get(`/users/userExists/${username}`).toPromise();
      return result.data;
    } catch (error) {
      this.showError(error);

    }
  }

  async getAllUsers() {
    try {
      const users: any = await this.httpClient.get('/users').toPromise();
      return users.data;
    } catch (error) {
      this.showError(error);

    }
  }

  async isSuperAdmin(username: string) {

    try {
      const data: any = await this.httpClient.get(`/users/isSuperAdminUser/${username}`).toPromise();
      return data.data;
    } catch (error) {
      this.showError(error);
      return false;
    }
  }
  async isCurrentUserSuperAdmin() {
    try {
      const username = await this.getCurrentUser();
      return await this.isSuperAdmin(username);
    } catch (error) {
      this.showError(error);
      return false;
    }
  }
  async isAdmin(username: string) {
    try {
      const data: any = await this.httpClient.get(`/users/isAdminUser/${username}`).toPromise();
      return data.data; // returns false or the list of groups a user is an admin to
    } catch (error) {
      this.showError(error);
      return false;
    }
  }
  async isCurrentUserAdmin() {
    try {
      const username = await this.getCurrentUser();
      return await this.isAdmin(username);
    } catch (error) {
      this.showError(error);
      return false;
    }
  }

  async isCurrentUserGroupAdmin(groupName: string) {
    try {
      const username = await this.getCurrentUser();
      const admin = await this.isAdmin(username);
      const isAdmin = admin.filter(a => a.attributes.name === groupName && a.attributes.role === 'admin');
      return isAdmin && isAdmin.length > 0;
    } catch (error) {
      this.showError(error);
      return false;
    }
  }

  async getCurrentUser() {
    return await localStorage.getItem('user_id');
  }
  private showError(error: any) {
    console.log(error);
    if (typeof error.status === 'undefined') {
      this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
    }
  }
}
