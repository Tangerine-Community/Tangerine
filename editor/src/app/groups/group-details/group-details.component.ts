import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { UserService } from '../../core/auth/_services/user.service';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { MatTabChangeEvent } from '@angular/material';
import uuidv4 from 'uuid/v4'
import { WindowRef } from 'src/app/core/window-ref.service';

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
  groupUrl;
  constructor(
    private route: ActivatedRoute,
    private windowRef: WindowRef,
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
      this.groupUrl =
      `${this.windowRef.nativeWindow.location.origin}${this.windowRef.nativeWindow.location.pathname}`;
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
  generateFormId() {
    return 'form-' + uuidv4()
  }

  generateUuid() {
    return uuidv4()

  }


  async addForm() {
    let formId = this.generateFormId()
    let formTitle = `New Form`
    let itemOneId = uuidv4()
    let itemTwoId = uuidv4()

    let formsJson = await this.http.get<Array<any>>(`/editor/${this.groupName}/content/forms.json`).toPromise()
    formsJson.push({
      id: formId,
      title: formTitle,
      type: 'form',
      src: `./assets/${formId}/form.html`
    })


    const files = [
      {
        groupId: this.groupName,
        filePath: `./forms.json`,
        fileContents: JSON.stringify(formsJson) 
      },
      {
        groupId: this.groupName,
        filePath: `./${formId}/form.html`,
        fileContents: `
        <tangy-form id="${formId}" title="${formTitle}">
          <tangy-form-item id="item_${uuidv4()}" title="Item 1">
            <template>
              <tangy-input name="input1" label="First question..."></tangy-input>
            </template>
          </tangy-form-item>
        </tangy-form>
        ` 
      }
    ]

    for (let file of files) {
      await this.http.post('/editor/file/save', file).toPromise()
    }

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
}
