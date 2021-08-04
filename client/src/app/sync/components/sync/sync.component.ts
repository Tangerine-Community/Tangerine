import { UserService } from './../../../shared/_services/user.service';
import { SyncService } from './../../sync.service';
import {Component, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';
import {ReplicationStatus} from "../../classes/replication-status.class";
import { SyncDirection } from '../../sync-direction.enum';

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

  isSyncing = false
  cancelling = false
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
  dbDocCount:number
  replicationStatus: ReplicationStatus
  errorMessage: any
  pullError: any
  pushError: any
  wakeLock: any
  runComparison: string;
  comparisonDisabled = false;
  rewindDisabled = false;
  indexing: any
  indexingMessage: string

  @Input() fullSync: string;
  currentCheckedValue: boolean = null

  constructor(
    private syncService: SyncService,
    private userService: UserService,
    private ren: Renderer2
  ) { }

  async ngOnInit() {
    this.syncMessage = ''
    this.direction = ''
    this.checkpointMessage = ''
    this.diffMessage = ''
    this.startNextBatchMessage = ''
    this.pendingBatchMessage = ''
    this.otherMessage = ''
    this.errorMessage = ''
    this.runComparison = null
    this.indexingMessage = ''
    this.syncService.onCancelled$.subscribe({
      next: () => {
        this.cancelling = false
      }
    })
  }

  async sync() {
    this.isSyncing = true
    this.syncMessage = ''
    this.direction = ''
    this.checkpointMessage = ''
    this.diffMessage = ''
    this.startNextBatchMessage = ''
    this.pendingBatchMessage = ''
    this.otherMessage = ''
    this.status = STATUS_IN_PROGRESS
    this.errorMessage = ''
    this.pullError = ''
    this.pushError = ''
    this.indexingMessage = ''
    this.indexing = null
    
    try {
      this.wakeLock =  await navigator['wakeLock'].request('screen');
    } catch (err) {
      // the wake lock request fails - usually system related, such low as battery
      console.log(`${err.name}, ${err.message}`);
    }
    
    this.subscription = this.syncService.syncMessage$.subscribe({
      next: (progress) => {
        if (progress) {
          let pendingMessage = '', docPulled = ''
          // this.syncMessage = ''
          if (typeof progress.message !== 'undefined') {
            // this.otherMessage = progress.message
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
            this.otherMessage = ''
          }
          
          if (typeof progress.pending !== 'undefined') {
            pendingMessage = progress.pending + ' pending; '
          }
          if (typeof progress.pulled !== 'undefined') {
            docPulled = progress.pulled + ' docs saved; '
          }
          if (typeof progress.error !== 'undefined') {
            this.errorMessage = progress.error
          } else {
            this.errorMessage = null
          }
          if (typeof progress.pullError !== 'undefined') {
            this.pullError = progress.pullError
          } else {
            if (progress.hadPullSuccess) {
              this.pullError = null
            }
          }
          if (typeof progress.pushError !== 'undefined') {
            this.pushError = progress.pushError
          } else {
            if (progress.hadPushSuccess) {
              this.pushError = null
            }
          }
          if (typeof progress.remaining !== 'undefined' && progress.remaining !== null) {
            this.syncMessage = docPulled + progress.remaining + '% remaining to sync '
          } else {
            // this.syncMessage = ''
          }
          if (typeof progress.pulled !== 'undefined' && progress.pulled !== '') {
            this.syncMessage = pendingMessage + progress.pulled + ' docs saved. '
          }
          if (typeof progress.pushed !== 'undefined' && progress.pushed !== '') {
            this.syncMessage = pendingMessage + progress.pushed + ' docs uploaded. '
          }
          if (typeof progress.direction !== 'undefined' && progress.direction !== '') {
            this.direction = 'Direction: ' + progress.direction
          } else {
            this.direction = ''
          }
          if (progress.indexing) {
            this.indexing = progress.indexing
            this.indexingMessage = 'Indexing ' + progress.indexing.view
          } else {
            this.indexingMessage = ''
          }
          // console.log('Sync Progress: ' + JSON.stringify(progress))
        }
      }
    })
    try {
      if (!this.runComparison && !this.fullSync) {
        // Normal Sync
        this.replicationStatus = await this.syncService.sync(false, null)
      } else if (this.runComparison === 'pull') {
        // Pull comparison
        this.otherMessage = "Forcing a sync before the Comparison Sync to make sure that all docs have been uploaded from the tablet."
        // force a sync to make sure all docs have been pushed. 
        this.replicationStatus = await this.syncService.sync(false, null)
        this.replicationStatus = await this.syncService.compareDocs('pull')
      } else if (this.runComparison === 'push') {
        // Push comparison
        this.replicationStatus = await this.syncService.compareDocs('push')
      } else if (this.fullSync === 'pull') {
        // Pull Rewind Full Sync
        this.otherMessage = "Forcing a sync before the Rewind Sync to make sure that all docs have been uploaded from the tablet."
        // force a sync to make sure all docs have been pushed. 
        this.replicationStatus = await this.syncService.sync(false, null)
        // Rewind sync is activated when you provide the 'fullSync' variable - push or pull:
        this.replicationStatus = await this.syncService.sync(false, SyncDirection.pull)
      } else if (this.fullSync === 'push') {
        // Push Rewind Full Sync
        this.replicationStatus = await this.syncService.sync(false, SyncDirection.push)
      }
      
      this.dbDocCount = this.replicationStatus.dbDocCount
      this.status = STATUS_COMPLETED
      this.subscription.unsubscribe();
    } catch (e) {
      // console.log('Sync Error: ' + JSON.stringify(e, Object.getOwnPropertyNames(e)))
      // console.trace()
      console.log(e)
      const userDb = await this.userService.getUserDatabase()
      this.dbDocCount = (await userDb.db.info()).doc_count
      this.status = STATUS_ERROR
      this.syncMessage = this.syncMessage + ' ERROR: ' + JSON.stringify(e.message)
      this.subscription.unsubscribe();
    }
    this.isSyncing = false
  }

  cancel() {
    this.cancelling = true
    this.syncService.cancel()
  }

  ngOnDestroy(): void {
    if (this.isSyncing) {
      this.syncService.cancel()
    }
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    if (this.wakeLock) {
      this.wakeLock.release()
      this.wakeLock = null;
    }
  }

  toggle() {
    this.show = !this.show
  }

  enableComparison(direction) {
    this.rewindDisabled = true
    this.runComparison = direction
    this.fullSync = null
  }

  enableRewind(direction) {
    this.comparisonDisabled = true
    this.fullSync = direction
    this.runComparison = null
  }

  reset() {
    this.runComparison = null
    this.fullSync = null
    this.comparisonDisabled = false
    this.rewindDisabled = false
  }

  checkState(el, direction, action) {
    setTimeout(() => {
      if (!el.disabled) {
        if (this.currentCheckedValue && this.currentCheckedValue === el.value) {
          el.checked = false;
          this.ren.removeClass(el['_elementRef'].nativeElement, 'cdk-focused');
          this.ren.removeClass(el['_elementRef'].nativeElement, 'cdk-program-focused');
          this.currentCheckedValue = null;
          this.reset()
        } else {
          this.currentCheckedValue = el.value
          if (action === 'compare') {
            this.enableComparison(direction)
          } else if (action === 'rewind') {
            this.enableRewind(direction)
          }
        }
      }
    })
  }

}
