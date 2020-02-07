import { ActivatedRoute } from '@angular/router';
import { GroupsService } from './../services/groups.service';
import { MenuService } from './../../shared/_services/menu.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-group-configure',
  templateUrl: './group-configure.component.html',
  styleUrls: ['./group-configure.component.css']
})
export class GroupConfigureComponent implements OnInit {

  constructor(
    private menuService:MenuService,
    private groupsService:GroupsService,
    private route: ActivatedRoute
  ) { }


  async ngOnInit() {
    this.route.params.subscribe(async params => {
      const group = await this.groupsService.getGroupInfo(params.groupId)
      this.menuService.setGroupMode(group._id, group.label, 'configure')
    })
  }

}
