import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { GroupsService } from './../services/groups.service';
import { Component, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {

  title:string
  breadcrumbs:Array<Breadcrumb>

  constructor(
    private groupsService: GroupsService
  ) {}

  async ngOnInit() {
    const group = await this.groupsService.getGroupInfo(window.location.hash.split('/')[2])
    this.title = group.label
    this.breadcrumbs = []
  }


}
