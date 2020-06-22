import { AppConfig } from './../../shared/_classes/app-config.class';
import { ServerConfigService } from './../../shared/_services/server-config.service';
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

  title = 'Data'
  breadcrumbs:Array<Breadcrumb> = []
  config:any = { enabledModules: [] }
  isGroupAdminUser
  groupId;

  constructor(
    private serverConfig: ServerConfigService,
    private userService:UserService,
    private route:ActivatedRoute
  ) { }

  async ngOnInit() {
    this.config = await this.serverConfig.getServerConfig()
    this.breadcrumbs = []
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    this.isGroupAdminUser = await this.userService.isCurrentUserGroupAdmin(this.groupId);
  }

}
