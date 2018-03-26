import { Component, OnInit } from '@angular/core';

import { SyncingService } from '../_services/syncing.service';
import { UserService } from '../../auth/_services/user.service';

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
    private userService: UserService
  ) { }

  async ngOnInit() {
    this.getUploadProgress();
  }

  async getUploadProgress() {
    const response = await this.userService.getAllUsers();
    const usernames = await this.getUsernames();
    this.docsNotUploaded = 0;
    this.docsUploaded = 0;
    this.syncPercentageComplete = 0;
    this.allUsersSyncData = await Promise.all(usernames.map(async username => {
      return await this.calculateUsersUploadProgress(username);
    }));
    this.allUsersSyncData.forEach(item => {
      this.docsNotUploaded += item.docsNotUploaded;
      this.docsUploaded += item.docsUploaded;
    });
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
    const usernames = await this.getUsernames();
   usernames.map(async username => {
      try {
        const result = await this.syncingService.pushAllrecords(username);
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

  async getUsernames() {
    const response = await this.userService.getAllUsers();
    return response
      .filter(user => user.hasOwnProperty('username'))
      .map(user => user.username);
  }

}
