import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { UserService } from '../../core/auth/_services/user.service';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { MatTabChangeEvent } from '@angular/material';
import { TangerineFormsService } from '../services/tangerine-forms.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';

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
  @ViewChild('copyFormOverlay') copyFormOverlay: ElementRef;
  constructor(
    private route: ActivatedRoute,
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
      this.group = await this.groupsService.getGroupInfo(this.groupId)
      this.groupLabel = this.group.label
    });
    try {
      this.isSuperAdminUser = await this.userService.isCurrentUserSuperAdmin();
      this.isGroupAdminUser = await this.userService.isCurrentUserGroupAdmin(this.groupName);
      await this.getForms();

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
    this.selectedTabIndex = event.index
    this.router.navigate([], {
      queryParams: { selectedTabIndex: this.selectedTabIndex }
    })
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
}
