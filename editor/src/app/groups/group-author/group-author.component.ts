import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { Component, OnInit } from '@angular/core';
import { ServerConfigService } from 'src/app/shared/_services/server-config.service';

@Component({
  selector: 'app-group-author',
  templateUrl: './group-author.component.html',
  styleUrls: ['./group-author.component.css']
})
export class GroupAuthorComponent implements OnInit {

  title = _TRANSLATE('Author')
  breadcrumbs:Array<Breadcrumb> = []
  isCaseModuleEnabled:boolean

  constructor(private serverConfig: ServerConfigService) { }

  async ngOnInit() {
    this.breadcrumbs = []
    const config = await this.serverConfig.getServerConfig()
    this.isCaseModuleEnabled = !!(config.enabledModules.find(module=>module==='case'))
  }

 }
