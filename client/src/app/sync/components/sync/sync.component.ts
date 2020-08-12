import { SyncService } from './../../sync.service';
import {Component, OnDestroy, OnInit} from '@angular/core';

const STATUS_INITIAL = 'STATUS_INITIAL'
const STATUS_IN_PROGRESS = 'STATUS_IN_PROGRESS'
const STATUS_COMPLETED = 'STATUS_COMPLETED'
const STATUS_ERROR = 'STATUS_ERROR'

@Component({
  selector: 'app-sync',
  templateUrl: './sync.component.html',
  styleUrls: ['./sync.component.css']
})
export class SyncComponent implements OnInit, OnDestroy {

  status = STATUS_INITIAL
  syncMessage: any
  direction: any
  checkpointMessage: any
  diffMessage: any
  startNextBatchMessage: any
  pendingBatchMessage: any
  otherMessage: any
  subscription: any
  show:boolean=false;

  constructor(
    private syncService: SyncService,
  ) { }

  async ngOnInit() {
    this.syncMessage = ''
    this.direction = ''
    this.checkpointMessage = ''
    this.diffMessage = ''
    this.startNextBatchMessage = ''
    this.pendingBatchMessage = ''
    this.otherMessage = ''
  }

  async sync() {
    this.syncMessage = ''
    this.direction = ''
    this.checkpointMessage = ''
    this.diffMessage = ''
    this.startNextBatchMessage = ''
    this.pendingBatchMessage = ''
    this.otherMessage = ''
    this.status = STATUS_IN_PROGRESS
    this.subscription = this.syncService.syncMessage$.subscribe({
      next: (progress) => {
        let pendingMessage = ''
        if (typeof progress.message !== 'undefined') {
          if (progress.type == 'checkpoint') {
            this.checkpointMessage = progress.message
          } else if (progress.type == 'diffing') {
            this.diffMessage = progress.message
          } else if (progress.type == 'startNextBatch') {
            this.startNextBatchMessage = progress.message
          } else if (progress.type == 'pendingBatch') {
            this.pendingBatchMessage = progress.message
          } else {
            this.otherMessage = progress.message
          }

          if (progress.direction !== '') {
            this.direction = 'Direction: ' + progress.direction
          }

        } else {
          if (typeof progress.pending !== 'undefined') {
            pendingMessage = progress.pending + ' pending;'
          }
          this.syncMessage = progress.docs_written + ' docs saved; ' + pendingMessage
          if (progress.direction !== '') {
            this.direction = 'Direction: ' + progress.direction
          }
        }

        console.log('Sync Progress: ' + JSON.stringify(progress))
      }
    })
    try {
      await this.syncService.sync()
      this.status = STATUS_COMPLETED
      this.subscription.unsubscribe();
    } catch (e) {
      // console.log('Sync Error: ' + JSON.stringify(e, Object.getOwnPropertyNames(e)))
      // console.trace()
      console.log(e)
      this.status = STATUS_ERROR
      this.syncMessage = this.syncMessage + ' ERROR: ' + JSON.stringify(e.message)
      this.subscription.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe()
  }

  toggle() {
    this.show = !this.show
  }

}
