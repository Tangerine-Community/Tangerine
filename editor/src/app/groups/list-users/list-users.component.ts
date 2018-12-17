import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { fromEvent, of } from 'rxjs';
import { _TRANSLATE } from '../../shared/_services/translation-marker';
import { TangyErrorHandler } from '../../shared/_services/tangy-error-handler.service';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.css']
})
export class ListUsersComponent implements OnInit {
  groupName;
  users;
  @ViewChild('search') search: ElementRef;
  constructor(
    private groupsService: GroupsService,
    private route: ActivatedRoute,
    private errorHandler: TangyErrorHandler
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupName = params.groupName;
    });
    await this.getUsersByGroup();
    fromEvent(this.search.nativeElement, 'keyup')
      .pipe(debounceTime(500))
      .pipe(distinctUntilChanged())
      .pipe(map(val => val['target'].value.trim()))
      .subscribe(async val => val ? await this.getUsersByGroupAndUsername(val.trim()) : of([]));
  }

  async getUsersByGroupAndUsername(username: string) {
    this.users = await this.groupsService.getUsersByGroupAndUsername(this.groupName, username);
  }

  async getUsersByGroup() {
    try {
      this.users = await this.groupsService.getUsersByGroup(this.groupName);
    } catch (error) {
      console.error(error);
    }
  }

  async removeUserFromGroup(username: string) {
    try {
      const removeUser = confirm(`Remove user: ${username} from Group: ${this.groupName}`);
      if (removeUser) {
        const result = await this.groupsService.removeUserFromGroup(this.groupName, username);
        this.errorHandler.handleError(_TRANSLATE('User Removed from Group Successfully'));
      }
    } catch (error) {
      console.log(error);
    }
  }
}
