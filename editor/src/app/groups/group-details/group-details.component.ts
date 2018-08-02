import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { UserService } from '../../core/auth/_services/user.service';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.css']
})
export class GroupDetailsComponent implements OnInit {
  forms;
  groupName;
  isSuperAdminUser;
  isGroupAdminUser;
  constructor(
    private route: ActivatedRoute,
    private groupsService: GroupsService,
    private userService: UserService,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupName = params.groupName;
    });
    try {
      this.isSuperAdminUser = await this.userService.isCurrentUserSuperAdmin();
      this.isGroupAdminUser = await this.userService.isCurrentUserGroupAdmin(this.groupName);
      this.forms = await this.groupsService.getFormsList(this.groupName);
    } catch (error) {
      console.log(error);
    }
  }

  generateFormId() {
    return 'form-' + Math.random()
  }

  generateUuid() {
    return Math.random()

  }

  UUID(separator?:string) {
    if (!separator) {
        separator = '';
    }
      var self = {};
      var lut = [];
      for (var i = 0; i < 256; i++) {
          lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
      }
      /**
       * Generates a UUID
       * @returns {string}
       */
      let generate = function(separator) {
          var d0 = Math.random() * 0xffffffff | 0;
          var d1 = Math.random() * 0xffffffff | 0;
          var d2 = Math.random() * 0xffffffff | 0;
          var d3 = Math.random() * 0xffffffff | 0;
          return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + separator +
              lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + separator + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + separator +
              lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + separator + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] +
              lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
      };
      return generate(separator);
  }

  async addForm() {
    console.log('add form')
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
          <tangy-form-item id="item_${this.UUID()}" title="Item 1">
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

    this.forms = await this.groupsService.getFormsList(this.groupName);


  }

  async deleteForm(groupName, formId) {
    console.log(groupName)
    console.log(formId)
    let confirmation = confirm('Are you sure you would like to remove this form?')
    if (!confirmation) return
    let formsJson = await this.http.get<Array<any>>(`/editor/${groupName}/content/forms.json`).toPromise()
    let newFormsJson = formsJson.filter(formInfo => formInfo.id !== formId)
    console.log(newFormsJson)

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
