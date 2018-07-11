import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-group-details',
  templateUrl: './group-details.component.html',
  styleUrls: ['./group-details.component.css']
})
export class GroupDetailsComponent implements OnInit {
  forms;
  groupName;
  constructor(
    private route: ActivatedRoute,
    private groupsService: GroupsService,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupName = params.groupName;
    });
    try {
      this.forms = await this.groupsService.getFormsList(this.groupName);
    } catch (error) {

    }
  }

  generateFormId() {
    return 'form-' + Math.random()
  }

  async addForm() {
    console.log('add form')
    let formId = this.generateFormId()
    let itemOneId = Math.random()
    let itemTwoId = Math.random()

    let formsJson = await this.http.get<Array<any>>(`/editor/${this.groupName}/content/forms.json`).toPromise()
    formsJson.push({
      id: formId,
      title: `New Form ${formId}`,
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
        <tangy-form id="${formId}">
          <tangy-form-item id="${itemOneId}" src="./assets/${formId}/${itemOneId}.html" title="Item 1"></tangy-form-item>
          <tangy-form-item id="${itemTwoId}" src="./assets/${formId}/${itemTwoId}.html" title="Summary" summary></tangy-form-item>
        </tangy-form>
        ` 
      },
      {
        groupId: this.groupName,
        filePath: `./${formId}/${itemOneId}.html`,
        fileContents: `
        <form on-open="" on-change="">
          <tangy-input name="input1" label="First question..."></tangy-input>
        </form>
        ` 
      },
      {
        groupId: this.groupName,
        filePath: `./${formId}/${itemTwoId}.html`,
        fileContents: `
        <form on-open="" on-change="">
          Thank you for filling out our survey.
        </form>
        ` 
      }
    ]

    for (let file of files) {
      await this.http.post('/editor/file/save', file).toPromise()
    }


  }

}
