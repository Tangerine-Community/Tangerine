import { Component, OnInit } from '@angular/core';
import { GroupsService } from './services/groups.service';
import { TruncatePipe } from '../pipes/truncate';
import { TangyErrorHandler } from '../shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from '../shared/_services/translation-marker';
import { WindowRef } from '../core/window-ref.service';
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

  constructor(
    private groupsService: GroupsService,
    private errorHandler: TangyErrorHandler,
    private windowRef: WindowRef
    ) {
  }


  async ngOnInit() {
    await this.getData();
    this.onResize(window);
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
    this.windowRef.nativeWindow.location = `${this.windowRef.nativeWindow.location.origin}/app/${groupId}/index.html#/groups/${groupId}`
  }
}
