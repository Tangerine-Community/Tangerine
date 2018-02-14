import { Component, OnInit } from '@angular/core';

import { SyncingService } from '../_services/syncing.service';

@Component({
  selector: 'app-sync-records',
  templateUrl: './sync-records.component.html',
  styleUrls: ['./sync-records.component.css']
})
export class SyncRecordsComponent implements OnInit {
  isSyncSuccesful: boolean = undefined;
  syncStatus = '';
  docsNotUploaded;
  docsUploaded;
  syncPercentageComplete;
  constructor(private syncingService: SyncingService) { }

  async ngOnInit() {
    this.calculateUploadProgress();
  }

  async calculateUploadProgress() {
    const result = await this.syncingService.getDocsNotUploaded();
    this.docsNotUploaded = result ? result.length : 0;
    this.docsUploaded = await this.syncingService.getNumberOfFormsLockedAndUploaded();
    this.syncPercentageComplete =
      ((this.docsUploaded / (this.docsNotUploaded + this.docsUploaded)) * 100) || 0;
  }
  async pushAllRecords() {
    this.isSyncSuccesful = undefined;
    try {
      const result = await this.syncingService.pushAllrecords();
      if (result) {
        this.isSyncSuccesful = true;
        this.calculateUploadProgress();
      }
    } catch (error) {
      console.error(error);
      this.isSyncSuccesful = false;
      this.calculateUploadProgress();
    }
  }


}
