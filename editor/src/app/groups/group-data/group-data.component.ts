import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from './../services/groups.service';
import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/auth/_services/user.service';

@Component({
  selector: 'app-group-data',
  templateUrl: './group-data.component.html',
  styleUrls: ['./group-data.component.css']
})
export class GroupDataComponent implements OnInit {

  title = 'Download Data'
  breadcrumbs:Array<Breadcrumb> = []
  isGroupAdminUser
  groupId;

  constructor(private userService:UserService, private route:ActivatedRoute) { }

  async ngOnInit() {
    this.breadcrumbs = []
    this.route.params.subscribe(async params => {
      this.groupId = params.groupId;
    });
    this.isGroupAdminUser = await this.userService.isCurrentUserGroupAdmin(this.groupId);
  }

}
