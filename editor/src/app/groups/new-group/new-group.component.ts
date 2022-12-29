import { Component, OnInit } from '@angular/core';
import { GroupsService } from '../services/groups.service';
import { _TRANSLATE } from '../../shared/_services/translation-marker';
import { TangyErrorHandler } from '../../shared/_services/tangy-error-handler.service';
import { WindowRef } from '../../../app/core/window-ref.service';
import {UserService} from '../../core/auth/_services/user.service';

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
    private userService: UserService
  ) { }

  async ngOnInit() {
      this.contentSets = await this.groupsService.getContentSets();
      if (this.contentSets.length > 0) {
        this.contentSet = this.contentSets[0]['id']
      }
      this.ready = true
  }

  async createGroup() {
    try {
      const username = await this.userService.getCurrentUser();
      const result: any = await this.groupsService.createGroup(this.groupName, this.contentSet);
      this.window.nativeWindow.location = `${this.window.nativeWindow.location.origin}/app/${result._id}/index.html#/groups/${result._id}`
      if (result && result.statusCode && result.statusCode === 200) {
        this.groupName = '';
        this.errorHandler.handleError(_TRANSLATE('Group Created Succesfully'));
      }
    } catch (error) {
      console.log(error);
      this.errorHandler.handleError(_TRANSLATE('Could not create Group'));
    }
  }

}
