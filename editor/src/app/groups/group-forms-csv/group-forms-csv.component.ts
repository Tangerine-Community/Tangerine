import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { UserService } from '../../core/auth/_services/user.service';
import { HttpClient } from '@angular/common/http';
import { WindowRef } from 'src/app/core/window-ref.service';
import { TangerineFormsService } from '../services/tangerine-forms.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { ServerConfigService } from 'src/app/shared/_services/server-config.service';


@Component({
  selector: 'app-group-forms-csv',
  templateUrl: './group-forms-csv.component.html',
  styleUrls: ['./group-forms-csv.component.css']
})
export class GroupFormsCsvComponent implements OnInit, AfterViewInit {

  title = _TRANSLATE('Download CSVs')
  breadcrumbs:Array<Breadcrumb> = []

  forms;
  groupId;
  group;
  groupLabel;
  responses;
  selectedTabIndex;
  enabledModules;
  copyFormId;
  archivedForms;
  activeForms;
  groupUrl;
  formsJsonURL;
  @ViewChild('copyFormOverlay', {static: true}) copyFormOverlay: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private windowRef: WindowRef,
    private groupsService: GroupsService,
    private userService: UserService,
    private tangerineForms: TangerineFormsService,
    private errorHandler: TangyErrorHandler,
    private serverConfig: ServerConfigService,
    private router: Router,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Download CSVs'),
        url: 'download-csv'
      }
    ]
    this.route.params.subscribe(async params => {
      this.groupId = params.groupId;
      this.group = await this.groupsService.getGroupInfo(this.groupId);
      this.groupLabel = this.group.label;
      this.formsJsonURL = `./forms.json`;
    });
    try {
      await this.getForms();
      this.groupUrl = `${this.windowRef.nativeWindow.location.origin}${this.windowRef.nativeWindow.location.pathname}`;
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
    }
  }

  async ngAfterViewInit() {
    // This is needed to ensure angular binds to selected Tab. The settimeout does the trick
    const config = await this.serverConfig.getServerConfig()
    this.enabledModules = config.enabledModules;
  }

  async getForms() {
    const config = await this.serverConfig.getServerConfig()
    const appendedForms = [
      {id: 'participant',title:_TRANSLATE('Participant')},
      {id: 'event-form',title:_TRANSLATE('Event Form')},
      {id: 'case-event',title: _TRANSLATE('Case Event')}];
    this.forms = (await this.tangerineForms.getFormsInfo(this.groupId)).map(formInfo => ({
      ...formInfo,
      printUrl: `${this.windowRef.nativeWindow.location.origin}${this.windowRef.nativeWindow.location.pathname}/#/tangy-form-editor/${this.groupId}/${formInfo.id}/print`
    }));;
    if(config.enabledModules.includes('case')){
      this.forms = [...this.forms, ...appendedForms]
    }
    this.activeForms = this.forms.filter(form => !form.archived);
    this.archivedForms = this.forms.filter(form => form.archived);
  }

}
