import { Component, OnInit } from '@angular/core';

import { SyncingService } from '../_services/syncing.service';
import { UserService } from '../../../shared/_services/user.service';
import {AppConfigService} from '../../../shared/_services/app-config.service';

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
  peerList = [];

  constructor(
    private syncingService: SyncingService,
    private userService: UserService,
    private appConfigService: AppConfigService
  ) {
    this.window = window;
  }

  async ngOnInit() {
    const appConfig = await this.appConfigService.getAppConfig();
    this.syncProtocol = appConfig.syncProtocol ? appConfig.syncProtocol : '1'
    if (typeof this.syncProtocol !== 'undefined' && this.syncProtocol === '2') {
    } else {
      this.getUploadProgress();
    }
    if (this.window.location.href.split('/').indexOf('cordova-hot-code-push-plugin') !== -1) {
      this.contentVersion = this.window.location.href.split('/')[this.window.location.href.split('/').indexOf('cordova-hot-code-push-plugin') + 1];
    }
  }

  async getUploadProgress() {
    const usernames = await this.userService.getUsernames();
    this.allUsersSyncData = await Promise.all(usernames.map(async username => {
      return await this.calculateUsersUploadProgress(username);
    }));
    this.docsNotUploaded = this.allUsersSyncData.reduce((acc, val) => acc + val.docsNotUploaded, 0);
    this.docsUploaded = this.allUsersSyncData.reduce((acc, val) => acc + val.docsUploaded, 0);
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
  async sync() {
    this.isSyncSuccesful = undefined;
    const usernames = await this.userService.getUsernames();
    const appConfig = await this.appConfigService.getAppConfig();
    usernames.map(async username => {
      try {
        const result = await this.syncingService.sync(username);
        if (result) {
          this.isSyncSuccesful = true;
          this.getUploadProgress();
        }
      } catch (error) {
        console.error(error);
        this.isSyncSuccesful = false;
        this.getUploadProgress();
      }
    });
  }
}


