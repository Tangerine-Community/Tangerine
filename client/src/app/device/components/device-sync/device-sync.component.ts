import { UserService } from './../../../shared/_services/user.service';
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
  dbDocCount:number
  
  constructor(
    private syncService:SyncService,
    private userService: UserService
  ) { }

  async ngOnInit() {
  }

  async sync() {
    this.syncInProgress = true
    this.direction = ''
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
        if (typeof progress.remaining !== 'undefined') {
          // this.syncMessage =  direction + docsWritten + pendingMessage
          this.syncMessage = progress.remaining + '% remaining to sync'
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
    const userDb = await this.userService.getUserDatabase()
    this.dbDocCount = (await userDb.db.info()).doc_count
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
