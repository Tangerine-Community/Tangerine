import { ActivatedRoute } from '@angular/router';
import { GroupsService } from './../services/groups.service';
import { MenuService } from './../../shared/_services/menu.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-group-data',
  templateUrl: './group-data.component.html',
  styleUrls: ['./group-data.component.css']
})
export class GroupDataComponent implements OnInit {

  constructor(
    private menuService:MenuService,
    private groupsService:GroupsService,
    private route: ActivatedRoute
  ) { }


  async ngOnInit() {
    this.route.params.subscribe(async params => {
      const group = await this.groupsService.getGroupInfo(params.groupId)
      this.menuService.setContext(group.label, 'data', group._id)
 
    })
  }

}
