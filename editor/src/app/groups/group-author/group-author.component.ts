import { GroupsService } from './../services/groups.service';
import { MenuService } from './../../shared/_services/menu.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-group-author',
  templateUrl: './group-author.component.html',
  styleUrls: ['./group-author.component.css']
})
export class GroupAuthorComponent implements OnInit {

  constructor(
    private menuService:MenuService,
    private groupsService:GroupsService,
    private route: ActivatedRoute
  ) { }


  async ngOnInit() {
    this.route.params.subscribe(async params => {
      const group = await this.groupsService.getGroupInfo(params.groupId)
      this.menuService.setContext(group.label, 'Author', 'author', group._id)
    })
  }

 }
