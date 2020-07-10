import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import * as pako from 'pako';

import { AppConfigService } from '../../../shared/_services/app-config.service';
import { UserService } from '../../../shared/_services/user.service';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import {VariableService} from "../../../shared/_services/variable.service";

@Injectable()
export class SyncingService {
  window;
  constructor(
    private appConfigService: AppConfigService,
    private http: HttpClient,
    private tangyFormsInfoService: TangyFormsInfoService,
    private userService: UserService,
    private variableService:VariableService
  ) {
    this.window = window;
  }

  async getLoggedInUser(): Promise<string> {
    return await this.variableService.get('currentUser');
  }

  async sync(username, skipByFormId?:Array<string>) {
    await this.pull(username)
    await this.push(username, skipByFormId)
    return true
  }

  async pull(username) {
    const appConfig = await this.appConfigService.getAppConfig()
    if (appConfig.centrallyManagedUserProfile) {
      // Pull the user profile.
      const userProfile = await this.userService.getUserProfile(username);
      const userProfileOnServer = await this.http.get(`${appConfig.serverUrl}api/${appConfig.groupId}/${userProfile._id}`, {
        headers: new HttpHeaders({
          'Authorization': appConfig.uploadToken
        })
      }).toPromise();
      const DB = await this.userService.getUserDatabase(username);
      await DB.put(Object.assign({}, userProfileOnServer, {_rev: userProfile._rev}))
    }

  }

  async push(username, skipByFormId:Array<string> = []) {
    try {
      const userProfile = await this.userService.getUserProfile(username);
      const appConfig = await this.appConfigService.getAppConfig()
      const DB = await this.userService.getUserDatabase(username);
      // ok
      const doc_ids = await this.getUploadQueue(username, skipByFormId);
      if (doc_ids && doc_ids.length > 0) {
        for (const doc_id of doc_ids) {
          const doc = await DB.get(doc_id);
          // Insert the userProfileId as an input.
          doc['items'][0]['inputs'].push({ name: 'userProfileId', value: userProfile._id });
          doc['items'][0]['inputs'].push({ name: 'tabletUserName', value: username });
          // Redact any fields marked as private.
          doc['items'].forEach(item => {
            item['inputs'].forEach(input => {
              if (input.private) {
                input.value = '';
              }
            });
          });
          const body = pako.deflate(JSON.stringify({ doc }), { to: 'string' });
          await this.http.post(`${appConfig.serverUrl}api/${appConfig.groupId}/upload`, body, {
            headers: new HttpHeaders({
              'Authorization': appConfig.uploadToken
            })
          }).toPromise();
          await this.markDocsAsUploaded([doc_id], username);
        }
      }
      return true; // No Items to Sync
    } catch (error) {
      throw (error);
    }
  }

  async getUploadQueue(username:string = '', skipByFormId:Array<string> = []) {
    const allFormIds = (await this.tangyFormsInfoService.getFormsInfo()).map(info => info.id)
    const includeByFormId = allFormIds.filter(id => !skipByFormId.includes(id))
    const DB = await this.userService.getUserDatabase(username);
    const appConfig = await this.appConfigService.getAppConfig()
    let localNotUploadedDocIds = []
    if (appConfig.uploadUnlockedFormReponses) {
      const results = await DB.query('responsesUnLockedAndNotUploaded/responsesUnLockedAndNotUploaded', {keys: includeByFormId});
      localNotUploadedDocIds = [
        ...localNotUploadedDocIds,
        ...results.rows.map(row => row.id)
      ]
    }
    const results = await DB.query('tangy-form/responsesLockedAndNotUploaded', {keys: includeByFormId});
    localNotUploadedDocIds = [
      ...localNotUploadedDocIds,
      ...results.rows.map(row => row.id)
    ]
    // Also mark the user profile for upload if it has been modifid since last upload.
    const userProfile = await this.userService.getUserProfile(username || await this.getLoggedInUser())
    return userProfile.lastModified > userProfile.uploadDatetime
      ? [ ...localNotUploadedDocIds, userProfile._id ]
      : localNotUploadedDocIds
  }

  async getDocsUploaded(username?: string) {
    const appConfig = await this.appConfigService.getAppConfig()
    let queryUploaded = 'responsesLockedAndUploaded'
    if (appConfig.uploadUnlockedFormReponses && appConfig.uploadUnlockedFormReponses === true) {
      queryUploaded = 'responsesUnLockedAndUploaded'
    }
    const DB = await this.userService.getUserDatabase(username);
    const results = await DB.query('tangy-form/' + queryUploaded);
    return results.rows;
  }

  async getAllUsersDocs(username?: string) {
    const DB = await this.userService.getUserDatabase(username);
    try {
      const result = await DB.allDocs({
        include_docs: true,
        attachments: true
      });
      return result;
    } catch (err) {
      console.log(err);
    }
  }
  async markDocsAsUploaded(replicatedDocIds, username) {
    const DB = await this.userService.getUserDatabase(username);
    return await Promise.all(replicatedDocIds.map(docId => {
      DB.upsert(docId, (doc) => {
        doc.uploadDatetime = Date.now();
        return doc;
      });
    }));
  }

}
