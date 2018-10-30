import { Component, OnInit } from '@angular/core';

import { WindowRef } from '../../../core/window-ref.service';
import { SyncingService } from '../_services/syncing.service';
import { UserService } from '../../auth/_services/user.service';
import {AppConfigService} from "../../../shared/_services/app-config.service";
import PouchDB from 'pouchdb';

@Component({
  selector: 'app-sync-records',
  templateUrl: './sync-records.component.html',
  styleUrls: ['./sync-records.component.css']
})
export class SyncRecordsComponent implements OnInit {
  isSyncSuccesful: boolean = undefined;
  syncStatus = '';
  allUsersSyncData;
  docsNotUploaded: number;
  docsUploaded: number;
  syncPercentageComplete: number;
  syncProtocol = '';
  contentVersion = '';
  window: any;

  constructor(
    private windowRef: WindowRef,
    private syncingService: SyncingService,
    private userService: UserService,
    private appConfigService: AppConfigService,
  ) {
    this.window = this.windowRef.nativeWindow;
  }

  async ngOnInit() {
    const appConfig = await this.appConfigService.getAppConfig();
    this.syncProtocol = appConfig.syncProtocol
    if (typeof this.syncProtocol !== 'undefined' && this.syncProtocol === 'replication') {
    } else {
      this.getUploadProgress();
    }
    if (this.window.location.href.split('/').indexOf('cordova-hot-code-push-plugin') !== -1) {
      this.contentVersion = this.window.location.href.split('/')[this.window.location.href.split('/').indexOf('cordova-hot-code-push-plugin')+1]
    }
  }

  async getUploadProgress() {
    const usernames = await this.userService.getUsernames();
    this.allUsersSyncData = await Promise.all(usernames.map(async username => {
      return await this.calculateUsersUploadProgress(username);
    }));
    this.docsNotUploaded = this.allUsersSyncData.reduce((acc, val) => { return acc + val.docsNotUploaded; }, 0);
    this.docsUploaded = this.allUsersSyncData.reduce((acc, val) => { return acc + val.docsUploaded; }, 0);
    this.syncPercentageComplete =
      ((this.docsUploaded / (this.docsNotUploaded + this.docsUploaded)) * 100) || 0;
  }
  async calculateUsersUploadProgress(username) {
    const uploadQueueResults = await this.syncingService.getUploadQueue(username);
    const docsNotUploaded = uploadQueueResults ? uploadQueueResults.length : 0;
    // const docsUploaded = await this.syncingService.getNumberOfFormsLockedAndUploaded(username);
    const docRowsUploaded = username ? await this.syncingService.getDocsUploaded(username) : await this.syncingService.getDocsUploaded();
    const docsUploaded = docRowsUploaded.length || 0;

    const syncPercentageComplete =
      ((docsUploaded / (docsNotUploaded + docsUploaded)) * 100) || 0;
    return {
      username,
      docsNotUploaded,
      docsUploaded,
      syncPercentageComplete,
      uploadQueueResults
    };
  }
  async getRemoteHost() {
    const appConfig = await this.appConfigService.getAppConfig();
    return appConfig.uploadUrl;
  }
  async pushAllRecords() {
    this.isSyncSuccesful = undefined;
    const usernames = await this.userService.getUsernames();
    const appConfig = await this.appConfigService.getAppConfig();
    this.syncProtocol = appConfig.syncProtocol
    usernames.map(async username => {
      try {
        if (typeof this.syncProtocol !== 'undefined' && this.syncProtocol === 'replication') {
          const userProfile = await this.userService.getUserProfile(username);
          const remoteHost = await this.getRemoteHost();
          const localDB = new PouchDB(username);
          const remoteDB = new PouchDB(remoteHost);
          localDB.replicate.to(remoteDB, {push:true}).on('complete', function (info) {
            console.log("yeah, we're done!" + JSON.stringify(info))
            this.isSyncSuccesful = true;
            let docsRead = info.docs_read
            let docsWritten = info.docs_written
            alert("Sync is complete. Docs read: " + docsRead + " Docs uploaded:" + docsWritten)
          }).on('error', function (err) {
            // boo, something went wrong!
            console.log("boo, something went wrong! error: " + err)
          });
        } else {
          const result = await this.syncingService.pushAllrecords(username);
          if (result) {
            this.isSyncSuccesful = true;
            this.getUploadProgress();
          }
        }
      } catch (error) {
        console.error(error);
        this.isSyncSuccesful = false;
        this.getUploadProgress();
      }
    });
  }

}
