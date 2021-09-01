import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { _TRANSLATE } from '../../shared/_services/translation-marker';
import { TangyErrorHandler } from '../../shared/_services/tangy-error-handler.service';
import { id as generate } from 'rangen';
import { WindowRef } from '../../core/window-ref.service';
import { Loc } from 'tangy-form/util/loc.js';
import { v4 as UUID } from 'uuid';
@Injectable()
export class GroupsService {
  constructor(
    private windowRef: WindowRef,
    private httpClient: HttpClient,
    private errorHandler: TangyErrorHandler
  ) { }

  async getGroupInfo(groupId) {
    return <any>await this
      .httpClient
      .get(`/nest/group/read/${groupId}`)
      .toPromise();
  }

  async getAllGroups() {
    try {
      return await this.httpClient.get('/nest/group/list').toPromise();
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async getUserGroupRoles(username) {
    try {
      return await this.httpClient.get(`/groups/${username}`).toPromise();
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async createGroup(groupName: string) {
    try {
      const result = await this.httpClient.post('/nest/group/create', { label: groupName }).toPromise();
      return result;
    } catch (error) {
      console.error(error);
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  /*
  Adds or updates user in the groups array of the users database
   */
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

  async downloadCSV(groupName: string, formId: string, selectedYear = '*', selectedMonth = '*', excludePII: boolean) {
    let sanitized = ''
    if (excludePII) {
      sanitized = '-sanitized'
    }
    try {
      if (selectedMonth === '*' || selectedYear === '*') {
        const result = await this.httpClient
          .get(`/api/csv${sanitized}/${groupName}/${formId}`)
          .toPromise();
        return result;
      } else {
        const result = await this.httpClient
          .get(`/api/csv${sanitized}/${groupName}/${formId}/${selectedYear}/${selectedMonth}`)
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

  async releasePWA(groupName: string, releaseType: string, versionTag: string, releaseNotes: string) {
    try {
      const result = await this.httpClient.post(`/editor/release-pwa/${groupName}`,
      {releaseType, versionTag, releaseNotes, buildId: UUID()}).toPromise();
      return result;
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Release took too long. Please try again.'));
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

  async apkIsBuilding(groupName: string, releaseType: string) {
    try {
      const result: any = await this.httpClient.get(`/releases/${releaseType}/apks/${groupName}.json`).toPromise();
      // return (result.processing === true) ? true : false;
      return result;
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async releaseAPK(groupName: string, releaseType: string, versionTag: string, releaseNotes: string) {
    try {
      const result = await this.httpClient.post(`/editor/release-apk/${groupName}`,
      {releaseType, versionTag, releaseNotes, buildId: UUID()}).toPromise();
      return result;
    } catch (error) {
      console.log("error: " + error)
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
      if (typeof error.error) {
        const errorMessage = 'Error generating APK: ' + error.error.message
        this.errorHandler.handleError(_TRANSLATE(errorMessage));
        throw new Error(errorMessage)
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

  async getLocationList(groupId: string) {
    const locationListFileName = 'location-list.json';
    try {
      return await this.httpClient.get(`/editor/${groupId}/content/${locationListFileName}`).toPromise();
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
    }
  }
  /**
   * replace spaces, punctuations, tabs , underscores with dashes (-) and removes any trailing dashes at the end of the string
   *
   */
  normalizeInput(input: string) {
    return input.toLowerCase().replace(' ', '_').replace(/[^a-z0-9]+|\s+/gmi, '-').replace(/-$/, '');
  }

  async getCaseDefinitions(groupId: string) {
    try {
      return await this.httpClient
        .get('/editor/groups/' + groupId + '/case-definitions.json')
        .toPromise() as [];

    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async getCaseStructure(groupId: string, fileName: string) {
    try {
      return await this.httpClient
        .get(`/editor/groups/${groupId}/${fileName}.json`)
        .toPromise();

    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async updateCaseDefinitionRevision(groupId: string, fileName: string) {
    try {
      const caseDefinition = await this.httpClient
        .get(`/editor/groups/${groupId}/${fileName}.json`)
        .toPromise();
      if (typeof caseDefinition['revision'] === 'undefined' || caseDefinition['revision'] === '') {
        return `0-${this.generateUUID()}`;
      }
      return `${+caseDefinition['revision'][0] + 1}-${this.generateUUID()}`;

    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async saveFileToGroupDirectory(groupId: string, fileContents, filePath, stringifyContents = true) {
    try {
      const file = {
        groupId,
        filePath,
        fileContents: stringifyContents ? JSON.stringify(fileContents, null, 2) : fileContents // format the JSON doc with 2 spaces if
      };
      await this.httpClient.post('/editor/file/save', file).toPromise();
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }
  async deleteFileFromGroupDirectory(groupId: string, filePath: string) {
    try {
      const params = {
        groupId,
        filePath
      };
      await this.httpClient.delete('/editor/file/save', { params }).toPromise();
    } catch (error) {
      if (typeof error.status === 'undefined') {
        this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
      }
    }
  }

  async publishSurvey(groupId, formId, releaseType = 'prod', appName) {
    try {
      const response = await this.httpClient.post(`/onlineSurvey/publish/${groupId}/${formId}`, {groupId, formId}, {observe: 'response'}).toPromise();
      await this.httpClient.get(`/editor/release-online-survey-app/${groupId}/${formId}/${releaseType}/${appName}/${response.body['uploadKey']}`).toPromise()
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
    }
  }
  async unPublishSurvey(groupId, formId) {
    try {
      await this.httpClient.put(`/onlineSurvey/unpublish/${groupId}/${formId}`, {groupId, formId}, {observe: 'response'}).toPromise();
      await this.httpClient.get(`/editor/unrelease-online-survey-app/${groupId}/${formId}/prod`).toPromise()
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
    }
  }
  generateUUID(separator?: string) {
    if (!separator) {
      separator = '';
    }
    const self = {};
    const lut = [];
    for (let i = 0; i < 256; i++) {
      lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
    }
    /**
     * Generates a UUID
     * @returns {string}
     */
    const generate = function (separator) {
      const d0 = Math.random() * 0xffffffff | 0;
      const d1 = Math.random() * 0xffffffff | 0;
      const d2 = Math.random() * 0xffffffff | 0;
      const d3 = Math.random() * 0xffffffff | 0;
      return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + separator +
        lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + separator + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + separator +
        lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + separator + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
        lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
    };
    return generate(separator);
  }
}
