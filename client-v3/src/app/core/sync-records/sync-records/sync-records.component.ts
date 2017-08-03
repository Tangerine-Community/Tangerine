import { async } from '@angular/core/testing/src/testing';
import { tryCatch } from 'rxjs/util/tryCatch';
import { Component, OnInit } from '@angular/core';
import { SyncingService } from '../_services/syncing.service';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-sync-records',
  templateUrl: './sync-records.component.html',
  styleUrls: ['./sync-records.component.css']
})
export class SyncRecordsComponent implements OnInit {
  isLoading = false;
  selectedDBs = [];
  DBS_TO_SYNC = environment.databasesToSync;
  constructor(private syncingService: SyncingService) { }

  ngOnInit() {
  }

  selectDB(el, database) {
    console.log(database);
    if (el.target.checked) {
      this.selectedDBs.push(database);
    } else {
      this.selectedDBs.splice(this.selectedDBs.indexOf(database), 1);
    }
  }

  async syncAllRecords() {
    this.toggleIsLoading();
    try {
      const result = await this.syncingService.syncAllRecords();
      if (result) {
        this.toggleIsLoading();
      }
    } catch (error) {
      this.toggleIsLoading();
    }
  }

  async pushAllRecords() {
    this.toggleIsLoading();
    try {
      const result = await this.syncingService.pushAllrecords();
      if (result) {
        this.toggleIsLoading();
      }
    } catch (error) {
      this.toggleIsLoading();
    }
  }
  async pullAllRecords() {
    this.toggleIsLoading();
    try {
      const result = await this.syncingService.pullAllRecords();
      if (result) {
        this.toggleIsLoading();
      }
    } catch (error) {
      this.toggleIsLoading();
    }
  }


  async syncSelectedRecords() {
    this.toggleIsLoading();
    try {
      const result = await this.syncingService.syncSelectedRecords(this.selectedDBs);
      if (result) {
        this.toggleIsLoading();
      }
    } catch (error) {
      this.toggleIsLoading();
    }
  }


  async pushSelectedRecords() {
    this.toggleIsLoading();
    try {
      const result = await this.syncingService.pushSelectedRecords(this.selectedDBs);
      if (result) {
        this.toggleIsLoading();
      }
    } catch (error) {
      this.toggleIsLoading();
    }
  }

  async pullSelectedRecords() {
    this.toggleIsLoading();
    try {
      const result = await this.syncingService.pullSelectedRecords(this.selectedDBs);
      if (result) {
        this.toggleIsLoading();
      }
    } catch (error) {
      this.toggleIsLoading();
    }
  }

  toggleIsLoading() {
    this.isLoading = !this.isLoading;
  }
}
