import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Component, OnInit } from '@angular/core';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { ProcessMonitorService } from 'src/app/shared/_services/process-monitor.service';


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
  ready = false

  constructor(
    private serverConfig:AppConfigService,
    private processMonitor:ProcessMonitorService
  ) { }

  async ngOnInit() {
    this.breadcrumbs = []
    this.groupId = window.location.pathname.split('/')[2]
    const process = this.processMonitor.start('group-deploy', 'Loading...')
    const config = await this.serverConfig.getAppConfig()
    this.syncProtocol2Enabled = !!(config.modules.find(module=>module==='sync-protocol-2'))
    this.processMonitor.stop(process.id)
    this.ready = true
  }

}
