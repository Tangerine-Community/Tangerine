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
  direction: any
  errorMessage: any
  
  constructor(
    private syncService:SyncService
  ) { }

  async ngOnInit() {
  }

  async sync() {
    this.syncInProgress = true
    this.direction = ''
    this.errorMessage = ''
    this.subscription = this.syncService.syncMessage$.subscribe({
      next: (progress) => {
        let pendingMessage = '', docsWritten = '', direction = '', docPulled = ''

        if (typeof progress.direction !== 'undefined') {
          direction = 'Direction: ' + progress.direction + '; '
        }
        if (typeof progress.docs_written !== 'undefined') {
          docsWritten = progress.docs_written + ' docs saved; '
        }
        if (typeof progress.pending !== 'undefined') {
          pendingMessage = progress.pending + ' pending; '
        }
        if (typeof progress.pulled !== 'undefined') {
          docPulled = progress.pulled + ' docs saved; '
        }
        if (typeof progress.error !== 'undefined') {
          this.errorMessage = progress.error
        }
        if (typeof progress.remaining !== 'undefined') {
          // this.syncMessage =  direction + docsWritten + pendingMessage
          this.syncMessage = progress.remaining + ' % remaining to sync; ' + docPulled
        }
        if (progress.direction !== '') {
          this.direction = 'Direction: ' + progress.direction
        }
        console.log('Sync Progress: ' + JSON.stringify(progress))
      }
    })
    // Pass isFirstSync flag as true in order to skip the push.
    const replicationStatus = await this.syncService.sync(true, true)
    this.subscription.unsubscribe();
    this.syncInProgress = false
    this.syncIsComplete = true
  }

  onContinueClick() {
    this.done$.next(true)
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
