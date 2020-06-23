import { SyncService } from './../../../sync/sync.service';
import { Subject } from 'rxjs';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-device-sync',
  templateUrl: './device-sync.component.html',
  styleUrls: ['./device-sync.component.css']
})
export class DeviceSyncComponent implements OnInit {

  done$ = new Subject()
  syncInProgress = false
  syncIsComplete = false
  syncMessage: any

  constructor(
    private syncService:SyncService
  ) { }

  async ngOnInit() {
  }

  async sync() {
    this.syncInProgress = true
    this.syncService.syncMessage$.subscribe({
      next: (progress) => {
        let pendingMessage = ''
        if (typeof progress.pending !== 'undefined') {
          pendingMessage = progress.pending + ' pending;'
        }
        this.syncMessage =  'Direction: ' + progress.direction + '; ' + progress.docs_written + ' docs saved; ' + pendingMessage
        console.log('Sync Progress: ' + JSON.stringify(progress))
      }
    })
    await this.syncService.sync(true)
    this.syncInProgress = false
    this.syncIsComplete = true
  }

  onContinueClick() {
    this.done$.next(true)
  }

}
