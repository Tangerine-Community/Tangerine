import { Component, OnInit } from '@angular/core';
import { GroupsService } from '../services/groups.service';
import { _TRANSLATE } from '../../shared/_services/translation-marker';
import { TangyErrorHandler } from '../../shared/_services/tangy-error-handler.service';
import { WindowRef } from '../../../app/core/window-ref.service';
import {UserService} from '../../core/auth/_services/user.service';
import {ProcessMonitorService} from "../../shared/_services/process-monitor.service";

const sleep = (milliseconds) => new Promise((res) => setTimeout(() => res(true), milliseconds))

@Component({
  selector: 'app-new-group',
  templateUrl: './new-group.component.html',
  styleUrls: ['./new-group.component.css']
})
export class NewGroupComponent implements OnInit {
  contentSet:string
  contentSets: any = [];
  ready = false

  groupName = '';
  constructor(
    private groupsService: GroupsService,
    private errorHandler: TangyErrorHandler,
    private window: WindowRef,
    private userService: UserService,
    private processMonitorService:ProcessMonitorService,

  ) { }

  async ngOnInit() {
      this.contentSets = await this.groupsService.getContentSets();
      if (this.contentSets.length > 0) {
        this.contentSet = this.contentSets[0]['id']
      }
      this.ready = true
  }

  async createGroup() {
    let process = this.processMonitorService.start('createNewGroup', 'Creating new group...')
    try {
      const result: any = await this.groupsService.createGroup(this.groupName, this.contentSet);
      if (result && result._id) {
        this.processMonitorService.stop(process.id)
        await sleep(500)
        process = this.processMonitorService.start('newGroupCreated', 'New Group created; forwarding you shortly...')
        await sleep(2000)
        this.processMonitorService.stop(process.id)
        this.window.nativeWindow.location = `${this.window.nativeWindow.location.origin}/app/${result._id}/index.html#/groups/${result._id}`
        this.groupName = '';
      } else {
        this.processMonitorService.stop(process.id)
        process = this.processMonitorService.start('waitForNewGroup', 'Error creating group...')
        await sleep(3000)
        this.processMonitorService.stop(process.id)
      }
    } catch (error) {
      console.log(error);
      this.processMonitorService.stop(process.id)
      this.errorHandler.handleError(_TRANSLATE('Could not create Group'));
    }
  }

}
