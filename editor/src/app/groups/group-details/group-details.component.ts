import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { UserService } from '../../core/auth/_services/user.service';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { MatTabChangeEvent } from '@angular/material';
import { TangerineFormsService } from '../services/tangerine-forms.service';

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
  copyFormId
  @ViewChild('copyFormOverlay') copyFormOverlay: ElementRef;
  constructor(
    private route: ActivatedRoute,
    private groupsService: GroupsService,
    private userService: UserService,
    private tangerineForms: TangerineFormsService,
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
      this.forms = await this.groupsService.getFormsList(this.groupName);
    } catch (error) {
      console.log(error)
    }
  }

  async ngAfterViewInit() {
    // This is needed to ensure angular binds to selected Tab. The settimeout does the trick
    setTimeout(() => {
      this.selectedTabIndex = this.route.snapshot.queryParamMap.get('selectedTabIndex')
    }, 500);
    this.enabledModules = await this.http.get(`/api/modules`).toPromise()
  }

  tabChanged(event: MatTabChangeEvent) {
    this.selectedTabIndex = event.index
    this.router.navigate([], {
      queryParams: { selectedTabIndex: this.selectedTabIndex }
    })
  }

  async addForm() {
    const formId = await this.tangerineForms.createForm(this.groupName, "New Form")
    this.router.navigate(['tangy-form-editor', this.groupName, formId])
  }

  async deleteForm(groupId, formId) {
    let confirmation = confirm('Are you sure you would like to remove this form?')
    if (!confirmation) return
    await this.tangerineForms.deleteForm(groupId, formId)
    this.forms = await this.groupsService.getFormsList(this.groupName);
  }

  async closeCopyFormDialog() {
    this.copyFormOverlay.nativeElement.close()
    this.forms = await this.groupsService.getFormsList(this.groupName);
  }

  onCopyFormClick(formId:string) {
    this.copyFormId = formId
    this.copyFormOverlay.nativeElement.open()
  }
}
