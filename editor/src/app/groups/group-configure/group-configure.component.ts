import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { Component, OnInit } from '@angular/core';
import { ServerConfigService } from 'src/app/shared/_services/server-config.service';

@Component({
  selector: 'app-group-configure',
  templateUrl: './group-configure.component.html',
  styleUrls: ['./group-configure.component.css']
})
export class GroupConfigureComponent implements OnInit {

  title = _TRANSLATE('Configure')
  breadcrumbs:Array<Breadcrumb> = []
  syncProtocol2Enabled:boolean

  constructor(private serverConfig: ServerConfigService) { }

  async ngOnInit() {
    this.breadcrumbs = []
    const config = await this.serverConfig.getServerConfig()
    this.syncProtocol2Enabled = !!(config.enabledModules.find(module=>module==='sync-protocol-2'))
  }

}
