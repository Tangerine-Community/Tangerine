import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { _TRANSLATE } from '../../shared/_services/translation-marker';
import { TangyErrorHandler } from '../../shared/_services/tangy-error-handler.service';
import { id as generate } from 'rangen';
import { Loc } from 'tangy-form/loc.js';
export interface Forms {
  id: string;
  title: string;
  src: string;
}
@Injectable()
export class GroupsService {
  constructor(
    private httpClient: HttpClient,
    private errorHandler: TangyErrorHandler
  ) { }

  async getUsersByUsername(username: string) {
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

  async getAllGroups() {
    try {
      const data: any = await this.httpClient.get('/groups/').toPromise();
      return data.filter((group) => group.attributes.name.indexOf('_reporting') === -1);
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async createGroup(groupName: string) {
    try {
      const result = await this.httpClient.post('/editor/group/new', { groupName }).toPromise();
      return result;
    } catch (error) {
      console.error(error);
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async addUserToGroup(groupName: string, username: string, role: string) {
    try {
      const result = await this.httpClient
        .post(`/groups/${groupName}/addUserToGroup`, { username, role })
        .toPromise();
      return result;
    } catch (error) {
      console.error(error);
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }
  async removeUserFromGroup(groupName: string, username: string) {
    try {
      const result = await this.httpClient
        .patch(`/groups/removeUserFromGroup/${groupName}`, {
          groupName,
          username
        })
        .toPromise();
      return result;
    } catch (error) {
      console.error(error);
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }
  async getFormsList(groupName: string) {
    try {
      let result = (await this.httpClient
        .get('/editor/groups/' + groupName + '/forms.json')
        .toPromise()) as Forms[];

      result.unshift(
        {
          id: 'user-profile',
          title: 'User Profile',
          src: '../content/user-profile/form.html'
        },
        {
          id: 'reports',
          title: 'Reports',
          src: '../content/reports/form.html'
        }
      );

      return result;
    } catch (error) {
      console.error(error);
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async downloadCSV(groupName: string, formId: string, selectedYear='*', selectedMonth='*') {
    try {
      if(selectedMonth === '*' || selectedYear === '*') {
        const result = await this.httpClient
          .get(`/api/csv/${groupName}/${formId}`)
          .toPromise();
        return result;
      } else {
        const result = await this.httpClient
          .get(`/api/csv/${groupName}/${formId}/${selectedYear}/${selectedMonth}`)
          .toPromise();
        return result;
      }
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async checkCSVDownloadStatus(stateUrl: string) {
    try {
      const result = await this.httpClient.get(stateUrl).toPromise();
      return result;
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async releasePWA(groupName: string, releaseType: string) {
    try {
      const result = await this.httpClient.get(`/editor/release-pwa/${groupName}/${releaseType}`).toPromise();
      return result;
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async releaseDat(groupName: string, releaseType: string) {
    try {
      const result = await this.httpClient.get(`/editor/release-dat/${groupName}/${releaseType}`).toPromise();
      return result;
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async releaseAPK(groupName: string, releaseType: string) {
    try {
      const result = await this.httpClient.get(`/editor/release-apk/${groupName}/${releaseType}`).toPromise();
      return result;
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async getUsersByGroup(groupName: string) {
    try {
      const result: any = await this.httpClient.get(`/groups/users/byGroup/${groupName}`).toPromise();
      return result.data;
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async getUsersByGroupAndUsername(groupName: string, username: string) {
    try {
      const result: any = await this.httpClient.get(`/groups/users/byGroupAndUsername/${groupName}/${username}`).toPromise();
      return result.data;
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }
  /**
   *
   * @param length `The length of the ID to be generated`
   * TODO @returns`string` of `ID` omitting characters that can be confused i.e 0,1,i,I,o,O
   */
  generateID(length = 8) {
    // const charSet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
    const charSet = 'alphanum';
    return generate({ length: length, charSet });
  }

  generateLocationIDs(locations) {
    const flatLocationList = Loc.flatten(locations);
    const ID = this.generateID();
    const index = flatLocationList.locations.findIndex(location => location.id === ID);
    if (index < 0) {
      return ID;
    } else {
      return this.generateLocationIDs(locations);
    }
  }
}
