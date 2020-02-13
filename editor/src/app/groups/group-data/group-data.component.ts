import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from './../services/groups.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-group-data',
  templateUrl: './group-data.component.html',
  styleUrls: ['./group-data.component.css']
})
export class GroupDataComponent implements OnInit {

  title = 'Download Data'
  breadcrumbs:Array<Breadcrumb> = []

  constructor(
  ) { }

  async ngOnInit() {
    this.breadcrumbs = []
  }

}
