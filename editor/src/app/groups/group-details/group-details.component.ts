import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { UserService } from '../../core/auth/_services/user.service';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { MatTabChangeEvent } from '@angular/material';
import uuidv4 from 'uuid/v4'
import { ComponentPortal } from '@angular/cdk/portal';
import { Overlay, GlobalPositionStrategy } from '@angular/cdk/overlay';
import { CopyFormComponent } from '../copy-form/copy-form.component';

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
    private overlay: Overlay,
    private route: ActivatedRoute,
    private groupsService: GroupsService,
    private userService: UserService,
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
    const formId = await this.groupsService.addForm(this.groupName)
    this.router.navigate(['tangy-form-editor', this.groupName, formId])
  }

  async deleteForm(groupName, formId) {
    let confirmation = confirm('Are you sure you would like to remove this form?')
    if (!confirmation) return
    let formsJson = await this.http.get<Array<any>>(`/editor/${groupName}/content/forms.json`).toPromise()
    let newFormsJson = formsJson.filter(formInfo => formInfo.id !== formId)

    await this.http.post('/editor/file/save', {
      groupId: groupName,
      filePath: './forms.json',
      fileContents: JSON.stringify(newFormsJson)
    }).toPromise()

    await this.http.delete('/editor/file/save', {params: new HttpParams()
      .set('groupId', groupName)
      .set('filePath', `./${formId}`)
    }).toPromise()

    this.forms = await this.groupsService.getFormsList(this.groupName);
    
  }

  closeCopyFormDialog() {
    this.copyFormOverlay.nativeElement.close()
  }

  onCopyFormClick(formId:string) {
    this.copyFormId = formId
    this.copyFormOverlay.nativeElement.open()
    /*
    const overlayRef = this.overlay.create(
      {
        positionStrategy: this.overlay.position().global() 
      }
    );
    const userProfilePortal = new ComponentPortal(CopyFormComponent);
    overlayRef.attach(userProfilePortal);
    */
  }
}
