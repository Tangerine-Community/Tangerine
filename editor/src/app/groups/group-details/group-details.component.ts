import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { UserService } from '../../core/auth/_services/user.service';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { MatTabChangeEvent } from '@angular/material';

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
  constructor(
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
  }

  tabChanged(event: MatTabChangeEvent) {
    this.selectedTabIndex = event.index
    this.router.navigate([], {
      queryParams: { selectedTabIndex: this.selectedTabIndex },
      queryParamsHandling: 'merge'
    })
  }
  generateFormId() {
    return 'form-' + Math.random()
  }

  generateUuid() {
    return Math.random()

  }


  async addForm() {
    let formId = this.generateFormId()
    let formTitle = `New Form`
    let itemOneId = Math.random()
    let itemTwoId = Math.random()

    let formsJson = await this.http.get<Array<any>>(`/editor/${this.groupName}/content/forms.json`).toPromise()
    formsJson.push({
      id: formId,
      title: formTitle,
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
          <tangy-form-item id="item_${this.groupsService.generateUUID()}" title="Item 1">
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
