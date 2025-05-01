import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { TangerineFormInfo } from './../../shared/_classes/tangerine-form.class';
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
import {
  CouchdbSyncSettings,
  CustomSyncSettings,
  FormSearchSettings
} from "../../tangy-forms/classes/form-info.class";

export interface FormSyncSetting {
  searchSettings: FormSearchSettings;
  src: string;
  customSyncSettings: CustomSyncSettings;
  couchdbSyncSettings: CouchdbSyncSettings;
  printUrl: string;
  id: string;
  title: string;
  type: string;
  archived: boolean;
}

@Component({
  selector: 'app-group-forms-sync',
  templateUrl: './group-forms-sync.component.html',
  styleUrls: ['./group-forms-sync.component.css']
})
export class GroupFormsSyncComponent implements OnInit, AfterViewInit {
  title = _TRANSLATE("Sync Settings")
  breadcrumbs:Array<Breadcrumb> = []
  // forms: Array<FormSyncSetting>;
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
    private http: HttpClient,
  ) { }

  async ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Sync Settings'),
        url: `sync`
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

  columns = [
    {
      columnDef: 'id',
      header: 'Form ID',
      cell: (form: FormSyncSetting) => `${form.id}`,
    },
    {
      columnDef: 'title',
      header: 'Name',
      cell: (form: FormSyncSetting) => `${form.title}`, // TODO: pipe through formTitleFromInfo
    },
    {
      columnDef: 'pull',
      header: '2-way Sync?',
      cell: (form: FormSyncSetting) => `${form.couchdbSyncSettings.pull}`,
    }
  ];
  dataSource;
  displayedColumns = this.columns.map(c => c.columnDef);
  async ngAfterViewInit() {
    // This is needed to ensure angular binds to selected Tab. The settimeout does the trick
    const config = await this.serverConfig.getServerConfig()
    this.enabledModules = config.enabledModules;
  }

  async getForms() {
    const formInfo = <Array<TangerineFormInfo>> await this.tangerineForms.getFormsInfo(this.groupId)
    this.forms = formInfo.map(formInfo => ({
      ...formInfo,
      printUrl: `${this.windowRef.nativeWindow.location.origin}${this.windowRef.nativeWindow.location.pathname}/#/tangy-form-editor/${this.groupId}/${formInfo.id}/print`
    }));
    this.activeForms = this.forms.filter(form => !form.archived);
    this.archivedForms = this.forms.filter(form => form.archived);
  }
  
  async toggleTwoWaySyncOnForm(groupId, formId) {
    const forms = await this.tangerineForms.getFormsInfo(groupId);
    const updatedForms = <Array<TangerineFormInfo>>forms.map(form => {
      return form.id === formId 
        ? form.couchdbSyncSettings.enabled 
          ? {
            ...form,
            couchdbSyncSettings: {
              enabled: true,
              filterByLocation: true,
              push: true,
              pull: form.couchdbSyncSettings.pull ? false : true
            }
          }
          : {
            ...form,
            couchdbSyncSettings: {
              enabled: true,
              filterByLocation: true,
              push: true,
              pull: false
            }
          }
        : form
    })
    await this.tangerineForms.saveFormsInfo(this.groupId, updatedForms)
  }

}
