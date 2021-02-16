import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { CouchdbSyncSettings, TangerineForm, TangerineFormInfo } from './../../shared/_classes/tangerine-form.class';
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { UserService } from '../../core/auth/_services/user.service';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { MatTabChangeEvent } from '@angular/material/tabs';
import {v4 as uuidv4} from 'uuid';;
import { WindowRef } from 'src/app/core/window-ref.service';
import { TangerineFormsService } from '../services/tangerine-forms.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ServerConfigService } from 'src/app/shared/_services/server-config.service';


@Component({
  selector: 'app-group-forms',
  templateUrl: './group-forms.component.html',
  styleUrls: ['./group-forms.component.css']
})
export class GroupFormsComponent implements OnInit, AfterViewInit {

  title = _TRANSLATE('Forms')
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
  canManageForms = false
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
        label: _TRANSLATE('Forms'),
        url: 'forms'
      }
    ]

    this.groupId = window.location.hash.split('/')[2]
    this.group = await this.groupsService.getGroupInfo(this.groupId)
    this.groupLabel = this.group.label;
    this.formsJsonURL = `./forms.json`;

    try {
      await this.getForms();
      this.groupUrl = `${this.windowRef.nativeWindow.location.origin}${this.windowRef.nativeWindow.location.pathname}`;
      // @todo
      this.canManageForms = true
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
    }
  }

  async ngAfterViewInit() {
    // This is needed to ensure angular binds to selected Tab. The settimeout does the trick
    setTimeout(() => {
      this.selectedTabIndex = this.route.snapshot.queryParamMap.get('selectedTabIndex');
    }, 500);
    const config = await this.serverConfig.getServerConfig()
    this.enabledModules = config.enabledModules;
  }

  tabChanged(event: MatTabChangeEvent) {
    this.selectedTabIndex = event.index;
    this.router.navigate([], {
      queryParams: { selectedTabIndex: this.selectedTabIndex }
    });
  }

  async getForms() {
    this.forms = (await this.tangerineForms.getFormsInfo(this.groupId)).map(formInfo => ({
      ...formInfo,
      printUrl: `${this.windowRef.nativeWindow.location.origin}${this.windowRef.nativeWindow.location.pathname}/#/tangy-form-editor/${this.groupId}/${formInfo.id}/print`
    }));;
    this.activeForms = this.forms.filter(form => !form.archived);
    this.archivedForms = this.forms.filter(form => form.archived);
  }

  async addForm() {
    const formId = await this.tangerineForms.createForm(this.groupId, "New Form")
    this.router.navigate(['edit', formId], {relativeTo: this.route})
  }

  async deleteForm(groupId, formId) {
    const confirmation = confirm(_TRANSLATE('Are you sure you would like to remove this form?'));
    if (!confirmation) { return; }
    try {
      await this.tangerineForms.deleteForm(groupId, formId);
      await this.getForms()
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could not Delete Form.'));
    }
  }

  async closeCopyFormDialog() {
    this.copyFormOverlay.nativeElement.close();
    await this.getForms()
  }

  onCopyFormClick(formId: string) {
    this.copyFormId = formId;
    this.copyFormOverlay.nativeElement.open();
  }

  async onArchiveFormClick(groupId: string, formId: string) {
    const confirmation = confirm(_TRANSLATE('Are you sure you would like to archive this form?'));
    if (!confirmation) { return; }
    try {
      await this.tangerineForms.archiveForm(groupId, formId);
      await this.getForms();
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could not Archive Form.'));
    }
  }
  async onUnArchiveFormClick(groupId: string, formId: string) {
    const confirmation = confirm(_TRANSLATE('Are you sure you would like to unarchive this form?'));
    if (!confirmation) { return; }
    try {
      await this.tangerineForms.unArchiveForm(groupId, formId);
      await this.getForms();
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could not Unarchive Form.'));
    }
  }
  async dropActive(event: CdkDragDrop<string[]>) {
    const confirmation = confirm(_TRANSLATE('Change order of forms?'));
    if (confirmation) {
      try {
        moveItemInArray(this.activeForms, event.previousIndex, event.currentIndex);
        await this.groupsService.saveFileToGroupDirectory(this.groupId, [...this.activeForms, ...this.archivedForms], this.formsJsonURL);
        await this.getForms();
      } catch (error) {
        this.errorHandler.handleError(_TRANSLATE('Could not change order of forms.'));
      }
    }
  }
  async dropArchived(event: CdkDragDrop<string[]>) {
    const confirmation = confirm(_TRANSLATE('Change order of forms?'));
    if (confirmation) {
      try {
        moveItemInArray(this.archivedForms, event.previousIndex, event.currentIndex);
        this.groupsService.saveFileToGroupDirectory(this.groupId, [...this.activeForms, ...this.archivedForms], this.formsJsonURL);
        await this.getForms();
      } catch (error) {
        this.errorHandler.handleError(_TRANSLATE('Could not change order of forms.'));
      }
    }
  }
}
