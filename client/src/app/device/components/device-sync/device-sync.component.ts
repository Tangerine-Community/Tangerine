import { SyncService } from './../../../sync/sync.service';
import { Subject } from 'rxjs';
import {Component, OnDestroy, OnInit} from '@angular/core';

@Component({
  selector: 'app-device-sync',
  templateUrl: './device-sync.component.html',
  styleUrls: ['./device-sync.component.css']
})
export class DeviceSyncComponent implements OnInit, OnDestroy {

  done$ = new Subject()
  syncInProgress = false
  syncIsComplete = false
  syncMessage: any
  subscription: any

  constructor(
    private syncService:SyncService
  ) { }

  async ngOnInit() {
  }

  async sync() {
    this.syncInProgress = true
    this.subscription = this.syncService.syncMessage$.subscribe({
      next: (progress) => {
        let pendingMessage = '', docsWritten = '', direction = ''

        if (typeof progress.direction !== 'undefined') {
          direction = 'Direction: ' + progress.direction + '; '
        }
        if (typeof progress.docs_written !== 'undefined') {
          docsWritten = progress.docs_written + ' docs saved; '
        }
        if (typeof progress.pending !== 'undefined') {
          pendingMessage = progress.pending + ' pending; '
        }
        this.syncMessage =  direction + docsWritten + pendingMessage
        console.log('Sync Progress: ' + JSON.stringify(progress))
      }
    })
    await this.syncService.sync(true)
    this.subscription.unsubscribe();
    this.syncInProgress = false
    this.syncIsComplete = true
  }

  onContinueClick() {
    this.done$.next(true)
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
