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
       await this.setTokens(token);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async setTokens(token) {
    const jwtData = jwt_decode(token);
    document.cookie = "Authorization=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `Authorization=${token}`;
    localStorage.setItem('token', token);
    localStorage.setItem('user_id', jwtData.username);
    localStorage.setItem('permissions', JSON.stringify(jwtData.permissions));
    const user = await this.userService.getMyUser();
    window['userProfile'] = user;
    window['userId'] = user._id;
    window['username'] = jwtData.username;
  }
  async getPermissionsList() {
    try {
      const data = await this.http.get('/permissionsList', {observe: 'response'}).toPromise();
      if (data.status === 200) {
        return data.body;
      }
    } catch (error) {
      console.error(error);
      return {groupPermissions: [], sitewidePermissions: []}
    }
  }
  async getSitewidePermissionsByUsername(username) {
    try {
      const data = await this.http.get(`/sitewidePermissionsByUsername/${username}`, {observe: 'response'}).toPromise();
      if (data.status === 200) {
        return data.body;
      }
    } catch (error) {
      console.error(error);
      return {groupPermissions:[], sitewidePermissions:[]}
    }
  }

  async getUserGroupPermissionsByGroupName(groupName) {
    try {
      const data = await this.http.get(`/users/groupPermissionsByGroupName/${groupName}`, {observe: 'response'}).toPromise();
      if (data.status === 200) {
        const token = data.body['data']['token'];
        await this.setTokens(token);
        return true;
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  setUserGroupPermissionsByGroupName(groupName) {

  }
  async updateUserPermissions(username, sitewidePermissions) {
    try {
      const data = await this.http.
      post(`/permissions/updateUserSitewidePermissions:username/${username}`, {sitewidePermissions}, {observe: 'response'}).toPromise();
      if (data.status === 200) {
        return data.body;
      }
    } catch (error) {
      console.error(error);
      return {groupPermissions:[], sitewidePermissions:[]}
    }
  }

  doesUserHaveAPermission(groupId, permission) {
    const allGroupsPermissions = JSON.parse(localStorage.getItem('permissions'))?.groupPermissions ?? [];
    const groupPermissions = (allGroupsPermissions.find(group => group.groupName === groupId)).permissions;
    return groupPermissions.includes(permission);
  }
  doesUserHaveAllPermissions(groupId, permissions= []) {
    const allGroupsPermissions = JSON.parse(localStorage.getItem('permissions'))?.groupPermissions ?? [];
    const groupPermissions = (allGroupsPermissions.find(group => group.groupName === groupId)).permissions;
    return permissions.every(e => groupPermissions.includes(e));
  }

  doesUserHaveSomePermissions(groupId, permissions) {
    const allGroupsPermissions = JSON.parse(localStorage.getItem('permissions'))?.groupPermissions ?? [];
    const groupPermissions = (allGroupsPermissions.find(group => group.groupName === groupId)).permissions;
    return permissions.some(e => groupPermissions.includes(e));
  }
}
