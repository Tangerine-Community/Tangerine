import { MenuService } from './../shared/_services/menu.service';
import { Component, OnInit } from '@angular/core';
import { GroupsService } from './services/groups.service';
import { TruncatePipe } from '../pipes/truncate';
import { TangyErrorHandler } from '../shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from '../shared/_services/translation-marker';
import { UserService } from '../core/auth/_services/user.service';
// import {RegistrationService} from '../registration/services/registration.service';
// import { AuthService } from '../auth.service';

@Component({
  // selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css'],
})
export class GroupsComponent implements OnInit {

  groups;
  breakpoint;
  isAdminUser = false

  constructor(
    private menuService:MenuService,
    private groupsService: GroupsService,
    private errorHandler: TangyErrorHandler,
    private userService:UserService
    ) {
  }


  async ngOnInit() {
    await this.getData();
    this.menuService.setContext(_TRANSLATE('Groups'), '', 'groups')
    this.onResize(window);
    this.isAdminUser = await this.userService.isCurrentUserAdmin()
  }

  onResize(target) {
    this.breakpoint = (target.innerWidth <= 832) ? 1 : 4;
  }

  async getData() {
    try {
      this.groups = await this.groupsService.getAllGroups();
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
    }
  }

  navigateToGroup(groupId) {
    window.location.href = `${window.location.origin}/app/${groupId}/index.html#/groups/${groupId}`
  }
}
