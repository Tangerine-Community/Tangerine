import { Component, OnInit, AfterContentInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from 'src/app/groups/services/groups.service';
import { UserService } from '../../_services/user.service';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { AuthenticationService } from '../../_services/authentication.service';
import { fromEvent, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';

@Component({
  selector: 'app-add-user-to-a-group',
  templateUrl: './add-user-to-a-group.component.html',
  styleUrls: ['./add-user-to-a-group.component.css']
})
export class AddUserToAGroupComponent implements OnInit, AfterViewInit {
  users;
  selectedUser;
  role;
  groupId;
  title = _TRANSLATE('Add user to group');
  breadcrumbs: Array<Breadcrumb> = [];
  allRoles;
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
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    this.allRoles = await this.authenticationService.getAllRoles(this.groupId);
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Security'),
        url: `security`
      },
      <Breadcrumb>{
        label: _TRANSLATE(`Add user to group`),
        url: `security/add-user`
      }
    ];
    this.role = {groupName: this.groupId, roles: []};
  }
  ngAfterViewInit(): void {
    if (this.search) {
      fromEvent(this.search.nativeElement, 'keyup')
        .pipe(debounceTime(500))
        .pipe(distinctUntilChanged())
        .pipe(map(val => val['target'].value.trim()))
        .subscribe(async (value) => value ? await this.getUsers(value.trim()) : of([])); // Dont send request for empty username
    }
  }

  async getUsers(username: string) {
    try {
      this.users = await this.usersService.searchUsersByUsername(username);
    } catch (error) {
      console.log(error);
    }
  }
  async usernameSelected(username: string) {
    this.selectedUser = username;
  }
  async addUserToGroup() {
    try {
      await this.groupsService.addUserToGroup(this.groupId, this.selectedUser, this.role);
      this.errorHandler.handleError(_TRANSLATE('User Added to Group Successfully'));
      this.router.navigate([`groups/${this.groupId}`]);
    } catch (error) {
      console.log(error);
    }
  }
  onSelectChange(role, value) {
    if (value) {
      this.role.roles = [...new Set([...this.role.roles, role])];
    } else {
      this.role.roles = this.role.roles.filter(perm => perm !== role);
    }
  }

}
