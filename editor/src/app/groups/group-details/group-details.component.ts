import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { UserService } from '../../core/auth/_services/user.service';
@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.css']
})
export class GroupDetailsComponent implements OnInit {
  forms;
  groupName;
  isSuperAdminUser;
  isGroupAdminUser;
  constructor(
    private route: ActivatedRoute,
    private groupsService: GroupsService,
    private userService: UserService
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupName = params.groupName;
    });
    try {
      this.isSuperAdminUser = await this.userService.isCurrentUserSuperAdmin();
      this.isGroupAdminUser = await this.userService.isCurrentUserGroupAdmin(this.groupName);
      this.forms = await this.groupsService.getFormsList(this.groupName);
    } catch (error) {
      console.log(error);
    }
  }

}
