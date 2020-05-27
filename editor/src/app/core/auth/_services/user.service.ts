import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { TangyErrorHandler } from '../../../shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from '../../../shared/_services/translation-marker';
@Injectable()
export class UserService {

  constructor(private httpClient: HttpClient, private errorHandler: TangyErrorHandler, private http: HttpClient) { }

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
  // Note that user1 is always assumed to be an admin.
  // returns false or the list of groups a user is an admin to
  // If user1, returns an empty list
  async isAdmin(username: string) {
    try {
      const data: any = await this.httpClient.get(`/users/isAdminUser/${username}`).toPromise();
      return (username === 'user1' && data.data === false) ? [] : data.data;
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
      const isAdmin = admin && admin.filter(a => a.attributes.name === groupName && a.attributes.role === 'admin');
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

  async canManageSitewideUsers() {
    return <boolean>await this.http.get('/user/permission/can-manage-sitewide-users').toPromise()
  }

  async deleteUser(username: string) {
    try {
      const data = await this.http.delete(`/users/delete/${username}`, {observe: 'response'}).toPromise();
      if (data.status === 200) {
        return true;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async updateUserDetails(payload) {
    try {
      const data = await this.httpClient.put(`/users/${payload.username}`, payload, {observe: 'response'}).toPromise();
      if (data.status === 200) {
        return data.body;
      }
    } catch (error) {
      console.error(error);
    }
  }

}
