import { Component, OnInit } from '@angular/core';

import { SyncingService } from '../_services/syncing.service';

@Component({
  selector: 'app-sync-records',
  templateUrl: './sync-records.component.html',
  styleUrls: ['./sync-records.component.css']
})
export class SyncRecordsComponent implements OnInit {
  isLoading = false;
  errorMessage;
  user = { username: '', password: '' };
  constructor(private syncingService: SyncingService) { }

  ngOnInit() {
  }

  async syncAllRecords() {
    this.toggleIsLoading();
    try {
      const result = await this.syncingService.syncAllRecords(this.user.username, this.user.password);
      if (result) {
        this.toggleIsLoading();
      }
    } catch (error) {
      this.errorMessage = error;
      console.log(error);
      this.toggleIsLoading();
    }
  }

  async pushAllRecords() {
    this.toggleIsLoading();
    try {
      const result = await this.syncingService.pushAllrecords(this.user.username, this.user.password);
      if (result) {
        this.toggleIsLoading();
      }
    } catch (error) {
      console.log(error);
      this.toggleIsLoading();
    }
  }
  async pullAllRecords() {
    this.toggleIsLoading();
    try {
      const result = await this.syncingService.pullAllRecords(this.user.username, this.user.password);
      if (result) {
        this.toggleIsLoading();
      }
    } catch (error) {
      console.log(error);
      this.toggleIsLoading();
    }
  }


  toggleIsLoading() {
    this.isLoading = !this.isLoading;
  }
}
