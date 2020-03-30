import { SyncService } from './../../sync.service';
import {Component, OnInit} from '@angular/core';

const STATUS_INITIAL = 'STATUS_INITIAL'
const STATUS_IN_PROGRESS = 'STATUS_IN_PROGRESS'
const STATUS_COMPLETED = 'STATUS_COMPLETED'
const STATUS_ERROR = 'STATUS_ERROR'

@Component({
  selector: 'app-sync',
  templateUrl: './sync.component.html',
  styleUrls: ['./sync.component.css']
})
export class SyncComponent implements OnInit {

  status = STATUS_INITIAL
  syncMessage: any

  constructor(
    private syncService: SyncService,
  ) { }

  async ngOnInit() {
    this.syncMessage = ''
  }

  async sync() {
    this.syncMessage = ''
    this.status = STATUS_IN_PROGRESS
    this.syncService.syncMessage$.subscribe({
      next: (progress) => {
        let pendingMessage = ''
        if (progress.pending) {
          pendingMessage = progress.pending + ' pending;'
        }
        this.syncMessage =  progress.docs_written + ' docs saved; ' + pendingMessage
        if (progress.direction !== '') {
          this.syncMessage = this.syncMessage + ' Direction: ' + progress.direction
        }
        console.log('Sync Progress: ' + JSON.stringify(progress))
      }
    })
    try {
      await this.syncService.sync()
      this.status = STATUS_COMPLETED
    } catch (e) {
      this.status = STATUS_ERROR
    }
  }

}
