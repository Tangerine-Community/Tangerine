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

  groupName = '';
  constructor(
    private groupsService: GroupsService,
    private errorHandler: TangyErrorHandler,
    private window: WindowRef,
    private userService: UserService
  ) { }

  ngOnInit() {

  }

  async createGroup() {
    try {
      const username = await this.userService.getCurrentUser();
      const result: any = await this.groupsService.createGroup(this.groupName);
      const isSuperAdmin = await this.userService.isSuperAdmin(username);
      if (!isSuperAdmin) {
        const addUserResult = await this.groupsService.addUserToGroup(result._id, username, 'admin');
      }
      this.window.nativeWindow.location = `${this.window.nativeWindow.location.origin}/app/${result._id}/index.html#/groups/${result._id}`
      if (result && result.statusCode && result.statusCode === 200) {
        this.groupName = '';
        this.errorHandler.handleError(_TRANSLATE('Group Created Succesfully'));
      }
    } catch (error) {
      console.log(error);
    }
  }

}
