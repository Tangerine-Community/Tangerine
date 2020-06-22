import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { GroupsService } from './../services/groups.service';
import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/core/auth/_services/authentication.service';


@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {

  title:string = ''
  breadcrumbs:Array<Breadcrumb>
  group
  isGroupPermissionsSet;
  constructor(
    private groupsService: GroupsService,
    private authenticationService: AuthenticationService
  ) {}

  async ngOnInit() {
    this.group = await this.groupsService.getGroupInfo(window.location.hash.split('/')[2])
    this.title = this.group.label
    this.breadcrumbs = []
    this.isGroupPermissionsSet = await this.authenticationService.getUserGroupPermissionsByGroupName(this.group._id);
  }
}
