import { GroupsService } from './../services/groups.service';
import { Component, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-group',
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private groupsService: GroupsService,
    private elementRef: ElementRef
  ) {}

  id: string;

  ngOnInit() {
  }


}
