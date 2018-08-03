import { Component, OnInit } from '@angular/core';

import { SyncingService } from '../_services/syncing.service';
import { UserService } from '../../auth/_services/user.service';
import {AppConfigService} from "../../../shared/_services/app-config.service";

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

  constructor(
    private syncingService: SyncingService,
    private userService: UserService,
    private appConfigService: AppConfigService,
  ) { }

  async ngOnInit() {
    this.getUploadProgress();
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
    const result = await this.syncingService.getIDsFormsLockedAndNotUploaded(username);
    const docsNotUploaded = result ? result.length : 0;
    const docsUploaded = await this.syncingService.getNumberOfFormsLockedAndUploaded(username);
    const syncPercentageComplete =
      ((docsUploaded / (docsNotUploaded + docsUploaded)) * 100) || 0;
    return {
      username,
      docsNotUploaded,
      docsUploaded,
      syncPercentageComplete
    };
  }
  async pushAllRecords() {
    this.isSyncSuccesful = undefined;
    const usernames = await this.userService.getUsernames();
    const appConfig = await this.appConfigService.getAppConfig();
    const syncProtocol = appConfig.syncProtocol
    usernames.map(async username => {
      try {
        if (typeof syncProtocol !== 'undefined' && syncProtocol === 'replication') {
          const result = await this.syncingService.replicate(username);
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
