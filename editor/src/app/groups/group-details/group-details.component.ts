import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { UserService } from '../../core/auth/_services/user.service';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { MatTabChangeEvent } from '@angular/material';
import uuidv4 from 'uuid/v4';
import { WindowRef } from 'src/app/core/window-ref.service';
import { TangerineFormsService } from '../services/tangerine-forms.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.css']
})
export class GroupDetailsComponent implements OnInit, AfterViewInit {
  forms;
  groupName;
  groupId;
  group;
  groupLabel;
  isSuperAdminUser;
  isGroupAdminUser;
  responses;
  selectedTabIndex;
  enabledModules;
  copyFormId;
  archivedForms;
  activeForms;
  groupUrl;
  formsJsonURL;
  @ViewChild('copyFormOverlay') copyFormOverlay: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private windowRef: WindowRef,
    private groupsService: GroupsService,
    private userService: UserService,
    private tangerineForms: TangerineFormsService,
    private errorHandler: TangyErrorHandler,
    private router: Router,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.groupName = params.groupName;
      this.groupId = params.groupName;
      this.group = await this.groupsService.getGroupInfo(this.groupId);
      this.groupLabel = this.group.label;
      this.formsJsonURL = `./forms.json`;
    });
    try {
      this.isSuperAdminUser = await this.userService.isCurrentUserSuperAdmin();
      this.isGroupAdminUser = await this.userService.isCurrentUserGroupAdmin(this.groupName);
      await this.getForms();
      this.groupUrl = `${this.windowRef.nativeWindow.location.origin}${this.windowRef.nativeWindow.location.pathname}`;
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
    }
  }

  async ngAfterViewInit() {
    // This is needed to ensure angular binds to selected Tab. The settimeout does the trick
    setTimeout(() => {
      this.selectedTabIndex = this.route.snapshot.queryParamMap.get('selectedTabIndex');
    }, 500);
    this.enabledModules = await this.http.get(`/api/modules`).toPromise();
  }

  tabChanged(event: MatTabChangeEvent) {
    this.selectedTabIndex = event.index;
    this.router.navigate([], {
      queryParams: { selectedTabIndex: this.selectedTabIndex }
    });
  }
  async getForms() {
    this.forms = await this.groupsService.getFormsList(this.groupName);
    this.activeForms = this.forms.filter(form => !form.archived);
    this.archivedForms = this.forms.filter(form => form.archived);
  }
  async addForm() {
    const formId = await this.tangerineForms.createForm(this.groupName, "New Form")
    this.router.navigate(['tangy-form-editor', this.groupName, formId])
  }

  async deleteForm(groupId, formId) {
    const confirmation = confirm(_TRANSLATE('Are you sure you would like to remove this form?'));
    if (!confirmation) { return; }
    try {
      await this.tangerineForms.deleteForm(groupId, formId);
      this.forms = await this.groupsService.getFormsList(this.groupName);
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could not Delete Form.'));
    }
  }

  async closeCopyFormDialog() {
    this.copyFormOverlay.nativeElement.close();
    this.forms = await this.groupsService.getFormsList(this.groupName);
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
    if (event.previousIndex <= 1 || event.currentIndex <= 1) { return; }
    const confirmation = confirm(_TRANSLATE('Change order of forms?'));
    if (confirmation) {
      try {
        moveItemInArray(this.activeForms, event.previousIndex, event.currentIndex);
        this.activeForms = (this.activeForms.filter(form => form.id !== 'user-profile' && form.id !== 'reports')).map(item => {
          delete item.printUrl;
          return item;
        });
        await this.groupsService.saveFileToGroupDirectory(this.groupId, [...this.activeForms, ...this.archivedForms], this.formsJsonURL);
        await this.getForms();
      } catch (error) {
        this.errorHandler.handleError(_TRANSLATE('Could not change order of forms.'));
      }
    }
  }
  async dropArchived(event: CdkDragDrop<string[]>) {
    if (event.previousIndex <= 1 || event.currentIndex <= 1) { return; }
    const confirmation = confirm(_TRANSLATE('Change order of forms?'));
    if (confirmation) {
      try {
        moveItemInArray(this.archivedForms, event.previousIndex, event.currentIndex);
        this.activeForms = (this.activeForms.filter(form => form.id !== 'user-profile' && form.id !== 'reports')).map(item => {
          delete item.printUrl;
          return item;
        });
        this.groupsService.saveFileToGroupDirectory(this.groupId, [...this.activeForms, ...this.archivedForms], this.formsJsonURL);
        await this.getForms();
      } catch (error) {
        this.errorHandler.handleError(_TRANSLATE('Could not change order of forms.'));
      }
    }
  }
}
