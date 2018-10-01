import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import PouchDB from 'pouchdb';
import * as PouchDBUpsert from 'pouchdb-upsert';
import * as pako from 'pako';

import { AppConfigService } from '../../../shared/_services/app-config.service';
import { UserService } from '../../auth/_services/user.service';
import { WindowRef } from '../../window-ref.service';

@Injectable()
export class SyncingService {
  window;
  constructor(
    private windowRef: WindowRef,
    private appConfigService: AppConfigService,
    private http: HttpClient,
    private userService: UserService
  ) {
    this.window = this.windowRef.nativeWindow;
  }

  getLoggedInUser(): string {
    return localStorage.getItem('currentUser');
  }

  async pushAllrecords(username) {
    try {
      const userProfile = await this.userService.getUserProfile(username);
      const appConfig = await this.appConfigService.getAppConfig()
      const DB = new PouchDB(username);
      const doc_ids = await this.getUploadQueue(username);
      if (doc_ids && doc_ids.length > 0) {
        for (const doc_id of doc_ids) {
          const doc = await DB.get(doc_id);
          // Insert the userProfileId as an input.
          doc['items'][0]['inputs'].push({ name: 'userProfileId', value: userProfile._id });
          // Redact any fields marked as private.
          doc['items'].forEach(item => {
            item['inputs'].forEach(input => {
              if (input.private) {
                input.value = '';
              }
            });
          });
          const body = pako.deflate(JSON.stringify({ doc }), { to: 'string' });
          await this.http.post(`${appConfig.serverUrl}api/${appConfig.groupName}/upload`, body, {
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

  /**
   *
   * @param {string} username
   * @param {boolean} includeName - run the view that returns the form name as value instead of true
   * @returns {Promise<any>}
   */
  async getUploadQueue(username?: string, includeName?: boolean) {
    const userProfile = await this.userService.getUserProfile(username);
    const userDB = username || await this.getLoggedInUser();
    const DB = new PouchDB(userDB);
    const appConfig = await this.appConfigService.getAppConfig()
    let queryExtra = ""
    if (includeName) {
      queryExtra = "WithName"
    }
    let queryNotUploaded = 'responsesLockedAndNotUploaded' + queryExtra
    let queryUploaded = 'responsesLockedAndUploaded' + queryExtra
    if (appConfig.uploadUnlockedFormReponses && appConfig.uploadUnlockedFormReponses === true) {
      queryNotUploaded = 'responsesUnLockedAndNotUploaded' + queryExtra
      queryUploaded = 'responsesUnLockedAndUploaded' + queryExtra
    }

    // let localFormsArray: string[] = [] // stores kv pairs if using includeName
    let localForms = {} // stores kv pairs if using includeName
    const localNotUploaded = await DB.query('tangy-form/' + queryNotUploaded);
    let localNotUploadedForms =  localNotUploaded.rows.map(row => {
      // return {"id":row.key, "val":row.value}
      // return new Map([[row.key, row.value]]);
      // return localForms[row.key] = row.value
      return {"id":row.key, "val":row.value}
    })
    // queueMap = queueMap.concat(localNotUploadedForms)
    // queueMap = new Map([...queueMap, ...localNotUploadedForms]);
    // let queueMap = new Map([...Object.keys(localForms), ...localNotUploadedForms.keys()]);

    const localNotUploadedDocIds = localNotUploaded.rows.map(row => row.key);
    let uploadQueue = []
    if (!this.window.navigator.onLine) {
      let queueMap = new Map([...Object.keys(localForms), ...localNotUploadedForms.keys()]);

      uploadQueue = localNotUploadedDocIds
      let result = {
        'uploadQueue':uploadQueue,
        'queueMap':queueMap
      }
      return result
    } else {
      let localUploaded;
        localUploaded = await DB.query('tangy-form/' + queryUploaded);
        let localUploadedForms =  localNotUploaded.rows.map(row => {
          return {"id":row.key, "val":row.value}
        })
        // queueMap = queueMap.concat(localUploadedForms)
      let queueMap = new Map([...localNotUploadedForms.keys(), ...localUploadedForms.keys()]);

      // Look for responses marked as uploaded but the server doesn't have.
      try {
        const hasKeys = await this.http.post(
          `${appConfig.serverUrl}api/${appConfig.groupName}/upload-check`,
            { keys: localUploaded.rows.map(row => row.id) },
            { headers: new HttpHeaders({ 'Authorization': appConfig.uploadToken })
          }).toPromise()
        // Filter out the keys (id's) that are already on the server.
        let localMissingUploads = localUploaded.rows
          .filter(row => {
            let result = hasKeys['indexOf'](row.id) === -1
            console.log("row.id: " + row.id + ":" + result)
            return result
          })
          .map(row => row.id);
        // merge both the array of local non-uploaded ids and missing id's from the server query
        uploadQueue = [
          ...localNotUploadedDocIds,
          ...localMissingUploads
        ];
        // return uploadQueue
        let result = {
          'uploadQueue':uploadQueue,
          'queueMap':queueMap
        }
        return result

      }
      catch(err) {
        // Perhaps window.onLine is true but we're having trouble communicating with the server.
        console.log(err)
        return localNotUploadedDocIds
      }
    }
  }

  async getDocsUploaded(username?: string, includeName?: boolean) {
    const appConfig = await this.appConfigService.getAppConfig()
    let queryExtra = ""
    if (includeName) {
      queryExtra = "WithName"
    }
    let queryUploaded = 'responsesLockedAndUploaded' + queryExtra
    if (appConfig.uploadUnlockedFormReponses && appConfig.uploadUnlockedFormReponses === true) {
      queryUploaded = 'responsesUnLockedAndUploaded' + queryExtra
    }
    const userDB = username || await this.getLoggedInUser();
    const DB = new PouchDB(userDB);
    const results = await DB.query('tangy-form/' + queryUploaded);
    return results.rows;
  }

  // async getFormsLockedAndUploaded(username?: string) {
  //   const userDB = username || await this.getLoggedInUser();
  //   const DB = new PouchDB(userDB);
  //   const results = await DB.query('tangy-form/responsesLockedAndUploaded');
  //   return results.rows;
  // }

  // async getFormsUnLockedAndUploaded(username?: string, includeName?: boolean) {
  //   let queryExtra = ""
  //   if (includeName) {
  //     queryExtra = "WithName"
  //   }
  //   const userDB = username || await this.getLoggedInUser();
  //   const DB = new PouchDB(userDB);
  //   const results = await DB.query('tangy-form/responsesLockedAndUploaded' + queryExtra);
  //   return results.rows;
  // }

  // async getNumberOfFormsLockedAndUploaded(username?: string) {
  //   const result = username ? await this.getFormsLockedAndUploaded(username) : await this.getFormsLockedAndUploaded();
  //   return result.length || 0;
  // }

  async getAllUsersDocs(username?: string) {
    const userDB = username || await this.getLoggedInUser();
    const DB = new PouchDB(userDB);
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
    PouchDB.plugin(PouchDBUpsert);
    const userDB = username;
    const DB = new PouchDB(userDB);
    return await Promise.all(replicatedDocIds.map(docId => {
      DB.upsert(docId, (doc) => {
        doc.uploadDatetime = new Date();
        return doc;
      });
    }));
  }

}
