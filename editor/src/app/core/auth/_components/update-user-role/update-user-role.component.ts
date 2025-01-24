import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from 'src/app/groups/services/groups.service';
import { UserService } from '../../_services/user.service';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { AuthenticationService } from '../../_services/authentication.service';

@Component({
  selector: 'app-update-user-role',
  templateUrl: './update-user-role.component.html',
  styleUrls: ['./update-user-role.component.css']
})
export class UpdateUserRoleComponent implements OnInit {

  user;
  username;
  role;
  groupId;
  title = _TRANSLATE('Update User\'s roles');
  breadcrumbs: Array<Breadcrumb> = [];
  allRoles;
  myGroup;
  @ViewChild('search', { static: false }) search: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private groupsService: GroupsService,
    private usersService: UserService,
    private errorHandler: TangyErrorHandler,
    private router: Router,
    private authenticationService: AuthenticationService
  ) { }

  async ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Security'),
        url: `security`
      },
      <Breadcrumb>{
        label: _TRANSLATE(`Update User's Roles`),
        url: `security/assign-role`
      }
    ];
    this.username = this.route.snapshot.paramMap.get('username');
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    this.allRoles = await this.authenticationService.getAllRoles(this.groupId);
    this.user = await this.usersService.getAUserByUsername(this.username);
    this.myGroup = this.user.groups.find(g => g.groupName === this.groupId);
    this.myGroup.roles = this.myGroup?.roles ?? [];
    this.role = { groupName: this.groupId, roles: this.myGroup.roles };
  }

  async addUserToGroup() {
    try {
      await this.groupsService.addUserToGroup(this.groupId, this.username, this.role);
      this.errorHandler.handleError(_TRANSLATE('User Added to Group Successfully'));
      this.router.navigate([`groups/${this.groupId}/configure/security`]);
    } catch (error) {
      console.log(error);
    }
  }

  doesUserHaveRole(role) {
    return this.myGroup.roles.indexOf(role) >= 0;
  }
  onSelectChange(role, value) {
    if (value) {
      this.role.roles = [...new Set([...this.role.roles, role])];
    } else {
      this.role.roles = this.role.roles.filter(perm => perm !== role);
    }
  }

}
