import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Component, OnInit } from '@angular/core';
import { ServerConfigService } from 'src/app/shared/_services/server-config.service';


@Component({
  selector: 'app-group-deploy',
  templateUrl: './group-deploy.component.html',
  styleUrls: ['./group-deploy.component.css']
})
export class GroupDeployComponent implements OnInit {

  title = _TRANSLATE('Deploy')
  breadcrumbs:Array<Breadcrumb> = []
  syncProtocol2Enabled: boolean
  groupId:string

  constructor(private serverConfig:ServerConfigService ) { }

  async ngOnInit() {
    this.breadcrumbs = []
    this.groupId = window.location.pathname.split('/')[2]
    const config = await this.serverConfig.getServerConfig()
    this.syncProtocol2Enabled = !!(config.enabledModules.find(module=>module==='sync-protocol-2'))
  }

}
