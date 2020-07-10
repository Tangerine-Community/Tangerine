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

  async getMyUser() {
    try {
      if (localStorage.getItem('user_id') === 'user1') {
        return {
          email: 'user1@tangerinecentral.org',
          firstName: 'user1',
          lastName: 'user1',
          username: 'user1',
          _id: 'user1'
        }
      } else {
        const data = await this.http.get(`/users/findMyUser/`, {observe: 'response'}).toPromise();
        if (data.status === 200) {
          return data.body['data'];
        }
      }
    } catch (error) {
      console.error(error);
      this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
    }
  }

  async getAUserByUsername(username) {
    try {
      const data = await this.http.get(`/users/findOneUser/${username}`, {observe: 'response'}).toPromise();
      if (data.status === 200) {
        return data.body['data'];
      }
    } catch (error) {
      console.error(error);
      this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
    }
  }


  async searchUsersByUsername(username: string) {
    try {
      const data: any = await this.httpClient
        .get(`/users/byUsername/${username}`)
        .toPromise();
      return data.data;
    } catch (error) {
      console.error(error);
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
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
  async restoreUser(username: string) {
    try {
      const data = await this.http.patch(`/users/restore/${username}`, {isActive: true}, {observe: 'response'}).toPromise();
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
      const data = await this.httpClient.put(`/users/update/${payload.username}`, payload, {observe: 'response'}).toPromise();
      if (data.status === 200) {
        return data.status;
      }
    } catch (error) {
      console.error(error);
      return 500;
    }
  }
  async updateMyUser(payload) {
    try {
      const data = await this.httpClient.put(`/users/updateMyUser/`,
      payload, {observe: 'response'}).toPromise();
      if (data.status === 200) {
        return data.status;
      }
    } catch (error) {
      console.error(error);
      return 500;
    }
  }

}
