import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { Observable } from 'rxjs/Rx';
import { _TRANSLATE } from '../../shared/_services/translation-marker';
import { TangyErrorHandler } from '../../shared/_services/tangy-error-handler.service';
@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit {
  users;
  selectedUser;
  role;
  group;
  @ViewChild('search') search: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private groupsService: GroupsService,
    private errorHandler: TangyErrorHandler,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.group = params.groupName;
    });
    Observable.fromEvent(this.search.nativeElement, 'keyup')
      .debounceTime(500)
      .distinctUntilChanged()
      .map(val => val['target'].value.trim())
      .subscribe(async (value) => value ? await this.getUsers(value.trim()) : Observable.of([])); // Dont send request for empty username
  }
  async getUsers(username: string) {
    try {
      this.users = await this.groupsService.getUsersByUsername(username);
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
