import { Component, OnInit } from '@angular/core';

import { SyncingService } from '../_services/syncing.service';

@Component({
  selector: 'app-sync-records',
  templateUrl: './sync-records.component.html',
  styleUrls: ['./sync-records.component.css']
})
export class SyncRecordsComponent implements OnInit {
  isLoading = false;
  constructor(private syncingService: SyncingService) { }

  ngOnInit() {
  }

  async pushAllRecords() {
    this.toggleIsLoading();
    try {
      const result = await this.syncingService.pushAllrecords();
      if (result) {
        this.toggleIsLoading();
      }
    } catch (error) {
      console.error(error);
      this.toggleIsLoading();
    }
  }


  toggleIsLoading() {
    this.isLoading = !this.isLoading;
  }
}
