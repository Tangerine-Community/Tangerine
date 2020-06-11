import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, AfterContentInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { fromEvent, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { _TRANSLATE } from '../../shared/_services/translation-marker';
import { TangyErrorHandler } from '../../shared/_services/tangy-error-handler.service';
import {Breadcrumb} from '../../shared/_components/breadcrumb/breadcrumb.component';
import { UserService } from 'src/app/core/auth/_services/user.service';
@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit, AfterContentInit, AfterViewInit
{
  users;
  selectedUser;
  role;
  group;
  title = _TRANSLATE('Assign User Role')
  breadcrumbs: Array<Breadcrumb> = []
  newUser = true;
  @ViewChild('search', { static: false }) search: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private groupsService: GroupsService,
    private usersService: UserService,
    private errorHandler: TangyErrorHandler,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.group = params.groupId;
    });
  }

  async ngAfterContentInit() {
    this.route.params.subscribe(async params => {
      this.selectedUser = params.username;
      if (typeof this.selectedUser !== 'undefined') {
        this.newUser = false;
        await this.getUsers(this.selectedUser)
        const groups = <Array<any>>await this.groupsService.getUserGroupRoles(this.selectedUser)
        const currentGroup = groups.find(group => group.attributes.name === this.group);
        const currentRole = currentGroup.attributes.role;
        this.role = currentRole;
      }
      if (this.newUser) {
        this.breadcrumbs = [];
      } else {
        this.breadcrumbs = [
          <Breadcrumb>{
            label: _TRANSLATE('Security'),
            url: `security`
          },
          <Breadcrumb>{
            label: _TRANSLATE('Assign Role'),
            url: `security/role/${this.selectedUser}`
          }
        ]
      }
    });
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
      const result = await this.groupsService.addUserToGroup(this.group, this.selectedUser, this.role);
      this.errorHandler.handleError(_TRANSLATE('User Added to Group Successfully'));
      this.router.navigate([`groups/${this.group}`]);
    } catch (error) {
      console.log(error);
    }
  }
}
