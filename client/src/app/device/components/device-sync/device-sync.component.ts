import { UserService } from './../../../shared/_services/user.service';
import { SyncService, FIRST_SYNC_STATUS } from './../../../sync/sync.service';
import { Subject } from 'rxjs';
import {Component, OnDestroy, OnInit} from '@angular/core';
import { VariableService } from 'src/app/shared/_services/variable.service';
import { Router } from '@angular/router';


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
  checkpointMessage: any
  diffMessage: any
  startNextBatchMessage: any
  pendingBatchMessage: any
  errorMessage: any
  pullError: any
  pushError: any
  dbDocCount:number
  otherMessage: any
  wakeLock: any
  indexing: any
  indexingMessage: string
  show:boolean=false;

  constructor(
    private syncService:SyncService,
    private variableService:VariableService,
    private router:Router,
    private userService: UserService
  ) { }

  async ngOnInit() {
  }

  async sync() {
    this.syncInProgress = true
    this.direction = ''
    this.checkpointMessage = ''
    this.diffMessage = ''
    this.startNextBatchMessage = ''
    this.pendingBatchMessage = ''
    this.errorMessage = ''
    this.otherMessage = ''
    this.pullError = ''
    this.pushError = ''
    this.syncMessage = ''
    this.indexingMessage = ''

    this.variableService.set('FIRST_SYNC_STATUS', FIRST_SYNC_STATUS.IN_PROGRESS)

    try {
      this.wakeLock =  await navigator['wakeLock'].request('screen');
    } catch (err) {
      // the wake lock request fails - usually system related, such low as battery
      console.log(`${err.name}, ${err.message}`);
    }
    
    this.subscription = this.syncService.syncMessage$.subscribe({
      next: (progress) => {
        if (progress) {
          let pendingMessage = '', docsWritten = '', direction = '', docPulled = '', syncMessage = ''
          this.syncMessage = ''
          if (typeof progress.message !== 'undefined') {
            if (progress.type == 'checkpoint') {
              this.checkpointMessage = progress.message
            } else if (progress.type == 'revs_diff') {
              this.diffMessage = progress.message
            } else if (progress.type == 'start_next_batch') {
              this.startNextBatchMessage = progress.message
            } else if (progress.type == 'pending_batch') {
              this.pendingBatchMessage = progress.message
            } else {
              this.otherMessage = progress.message
            }
          } else {
            this.otherMessage = ''
          }

          if (typeof progress.direction !== 'undefined') {
            direction = 'Direction: ' + progress.direction + '; '
          }
          if (typeof progress.docs_written !== 'undefined') {
            docsWritten = progress.docs_written + ' docs saved; '
          }
          if (typeof progress.pending !== 'undefined') {
            pendingMessage = progress.pending + ' docs pending; '
          }
          if (typeof progress.error !== 'undefined') {
            this.errorMessage = progress.error
          }
          if (typeof progress.pullError !== 'undefined') {
            this.pullError = progress.pullError
          }
          if (typeof progress.pushError !== 'undefined') {
            this.pushError = progress.pushError
          }
          if (typeof progress.remaining !== 'undefined' && progress.remaining !== null) {
            // this.syncMessage =  direction + docsWritten + pendingMessage
            this.syncMessage = progress.remaining + '% remaining to sync; '
          }
          if (typeof progress.pulled !== 'undefined' && progress.pulled !== '') {
            this.syncMessage = this.syncMessage + pendingMessage + progress.pulled + ' docs saved. '
          }
          if (typeof progress.direction !== 'undefined' && progress.direction !== '') {
            this.direction = 'Direction: ' + progress.direction
          } else {
            this.direction = ''
          }
          if (progress.indexing) {
            this.indexing = progress.indexing
            this.indexingMessage = progress.indexingMessage 
          }
          // console.log('Sync Progress: ' + JSON.stringify(progress))
        }
      }
    })
    // Pass isFirstSync flag as true in order to skip the push.
    const replicationStatus = await this.syncService.sync(true)
    this.subscription.unsubscribe();
    if (this.wakeLock) {
      this.wakeLock.release()
      this.wakeLock = null;
    }
    // if (!this.wakeLock) {
    //   console.log("wakeLock is destroyed.")
    // }
    this.syncInProgress = false
    const userDb = await this.userService.getUserDatabase()
    this.dbDocCount = (await userDb.db.info()).doc_count
    // We need to also check if there is a pushError, which is the error if there is no Internet connection to begin with
    // despite the fact there is no push on a first time sync.
    if (!replicationStatus.pullError && !replicationStatus.pushError) {
      this.variableService.set('FIRST_SYNC_STATUS', FIRST_SYNC_STATUS.COMPLETE)
    } else {
      this.router.navigate(['device-resync']);
    }
    this.syncIsComplete = true
  }

  onContinueClick() {
    this.done$.next(true)
  }

  toggle() {
    this.show = !this.show
  }

  ngOnDestroy(): void {
    if (this.syncInProgress) {
      this.syncService.cancel()
    }
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.wakeLock) {
      this.wakeLock.release()
      this.wakeLock = null;
    }
  }

}
