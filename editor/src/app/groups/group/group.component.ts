import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { GroupsService } from './../services/groups.service';
import { Component, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/core/auth/_services/user.service';


@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {

  title:string
  breadcrumbs:Array<Breadcrumb>
  isAdminUser = false

  constructor(
    private groupsService: GroupsService,
    private userService:UserService
  ) {}

  async ngOnInit() {
    this.isAdminUser = await this.userService.isCurrentUserAdmin()
    const group = await this.groupsService.getGroupInfo(window.location.hash.split('/')[2])
    this.title = group.label
    this.breadcrumbs = []
  }


}
