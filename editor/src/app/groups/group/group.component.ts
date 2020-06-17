import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { GroupsService } from './../services/groups.service';
import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/auth/_services/user.service';
import { AuthenticationService } from 'src/app/core/auth/_services/authentication.service';


@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {

  title:string = ''
  breadcrumbs:Array<Breadcrumb>
  isAdminUser = false
  group
  constructor(
    private groupsService: GroupsService,
    private userService: UserService,
    private authenticationService: AuthenticationService
  ) {}

  async ngOnInit() {
    this.isAdminUser = await this.userService.isCurrentUserAdmin()
    this.group = await this.groupsService.getGroupInfo(window.location.hash.split('/')[2])
    this.title = this.group.label
    this.breadcrumbs = []
    await this.authenticationService.getUserGroupPermissionsByGroupName(this.group._id);
  }
}
