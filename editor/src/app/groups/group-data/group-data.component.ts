import { ServerConfigService } from './../../shared/_services/server-config.service';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/auth/_services/user.service';
import { ProcessMonitorService } from 'src/app/shared/_services/process-monitor.service';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from 'src/app/shared/_classes/app-config.class';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import {TangerineFormsService} from "../services/tangerine-forms.service";
import {FilesService} from "../services/files.service";

@Component({
  selector: 'app-group-data',
  templateUrl: './group-data.component.html',
  styleUrls: ['./group-data.component.css']
})
export class GroupDataComponent implements OnInit {

  title = 'Data'
  breadcrumbs:Array<Breadcrumb> = []
  config:any = { enabledModules: [] }
  ready = false
  groupId;
  showUploads:boolean

  constructor(
    private serverConfig: ServerConfigService,
    private userService:UserService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private processMonitor:ProcessMonitorService,
    private tangerineForms: TangerineFormsService,
    private filesService: FilesService
  ) { }

  async ngOnInit() {
    const process = this.processMonitor.start('group-data', 'Loading...')
    this.config = await this.serverConfig.getServerConfig()
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    // const forms = <Array<FormInfo>>await this.http.get('./assets/forms.json').toPromise()
    // const forms =  <Array<FormInfo>>await this.filesService.get(this.groupId, 'forms.json')
    const forms =  <Array<FormInfo>>await this.tangerineForms.getFormsInfo(this.groupId)
    // const appConfig = <AppConfig>await this.http.get('./assets/app-config.json').toPromise()
    const appConfig = <AppConfig>await this.filesService.get(this.groupId, 'app-config.json')
    // Show uploads if this is not a Case module group or if it is a Case module group and there is a form listed for being created independent of a Case.
    if (
      appConfig.homeUrl !== 'case-home' ||
      forms.find(form => form.type !== 'case' && form.listed === true)
    ) {
      this.showUploads = true
    } else {
      this.showUploads = false
    }
    this.ready = true
    this.processMonitor.stop(process.id)
  }

}
