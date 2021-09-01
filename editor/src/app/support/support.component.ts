import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from './../groups/services/groups.service';
import { MenuService } from './../shared/_services/menu.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: ['./support.component.css']
})
export class SupportComponent implements OnInit {

  constructor(
    private menuService:MenuService,
    private groupsService:GroupsService,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      if (params.groupId) {
        const group = await this.groupsService.getGroupInfo(params.groupId)
        this.menuService.setContext(group.label, group._id, 'help')
      } else {
        this.menuService.setContext(_TRANSLATE('Help'), '', 'help')
      }
    })
  }


}
