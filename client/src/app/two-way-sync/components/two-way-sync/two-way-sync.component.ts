import { Component, OnInit } from '@angular/core';
import { TwoWaySyncService } from '../../services/two-way-sync.service';
import { UserService } from 'src/app/shared/_services/user.service';

const SYNC_STATE_READY = 'SYNC_STATE_READY'
const SYNC_STATE_IN_PROGRESS = 'SYNC_STATE_IN_PROGRESS'
const SYNC_STATE_SUCCESS = 'SYNC_STATE_SUCCESS'
const SYNC_STATE_FAIL = 'SYNC_STATE_FAIL'


@Component({
  selector: 'app-two-way-sync',
  templateUrl: './two-way-sync.component.html',
  styleUrls: ['./two-way-sync.component.css']
})
export class TwoWaySyncComponent implements OnInit {

  pulled = 0
  pushed = 0
  conflicts = []
  state = SYNC_STATE_READY

  constructor(
    private readonly twoWaySyncService:TwoWaySyncService,
    private readonly userService:UserService
  ) { }

  ngOnInit() {
  }

  async sync() {
    this.state = SYNC_STATE_IN_PROGRESS
    try {
      const replicationStatus = await this.twoWaySyncService.sync(this.userService.getCurrentUser())
      this.pulled = replicationStatus.pulled
      this.pushed = replicationStatus.pushed + replicationStatus.forcePushed
      this.conflicts = replicationStatus.conflicts
      this.state = SYNC_STATE_SUCCESS
    } catch (error) {
      console.log(error)
      this.state = SYNC_STATE_FAIL
    }

  }

}
