import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { _TRANSLATE } from '../../shared/_services/translation-marker';
import { TangyErrorHandler } from '../../shared/_services/tangy-error-handler.service';
export interface Forms {
  id: string;
  title: string;
  src: string;
}
@Injectable()
export class GroupsService {

  constructor(private httpClient: HttpClient, private errorHandler: TangyErrorHandler) { }
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

  async getFormsList(groupName: string) {
    try {
      let result = await this.httpClient.get('../editor/groups/' + groupName + '/forms.json').toPromise() as Forms[];

      result.unshift({
        id: 'user-profile',
        title: 'User Profile',
        src: '../content/user-profile/form.html'
      }, {
          id: 'reports',
          title: 'Reports',
          src: '../content/reports/form.html'
        });

      return result;
    } catch (error) {
      console.error(error);
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async downloadCSV(groupName: string, formId: string) {
    try {
      const result = await this.httpClient.get(`/csv/${groupName}/${formId}`).toPromise();
      return result;
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
}
