import { AfterContentInit, ElementRef, Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {MatTabChangeEvent} from "@angular/material";

@Component({
  selector: 'app-ng-tangy-form-editor',
  templateUrl: './ng-tangy-form-editor.component.html',
  styleUrls: ['./ng-tangy-form-editor.component.css']
})
export class NgTangyFormEditorComponent implements AfterContentInit {

  @ViewChild('container') container: ElementRef;
  @ViewChild('header') header: ElementRef;
  containerEl: any;
  groupId;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  async ngAfterContentInit() {

    this.containerEl = this.container.nativeElement 

    let formId = this.route.snapshot.paramMap.get('formId');
    let groupName = this.route.snapshot.paramMap.get('groupName');

    let formsJson = await this.http.get<Array<any>>(`/editor/${groupName}/content/forms.json`).toPromise()
    let formInfo = formsJson.find(formInfo => formInfo.id === formId)
    let formHtml = await this.http.get(`/editor/${groupName}/content/${formId}/form.html`, {responseType: 'text'}).toPromise()
    let pathArray = window.location.hash.split( '/' );
    this.groupId = pathArray[2];

    this.containerEl.innerHTML = `
      <tangy-form-editor style="margin:15px">
        <template>
          ${formHtml}
        </template>
      </tangy-form-editor>
    `
    const tangyFormEditorEl = this.containerEl.querySelector('tangy-form-editor')
    tangyFormEditorEl.addEventListener('tangy-form-editor-change', event => this.saveForm(event.detail))
  }

  tabChanged = async (tabChangeEvent: MatTabChangeEvent): Promise<void> => {
      // console.log('tabChangeEvent => ', tabChangeEvent);
      // console.log('index => ', tabChangeEvent.index);
      if (tabChangeEvent.index === 1) {
        let url = `/#/groups/${this.groupId}`;
        window.location.replace(url);
      }
  }

  async saveForm(formHtml) {
    let files = []
    let state = this.containerEl.querySelector('tangy-form-editor').store.getState()
    // Update forms.json.
    let formsJson = await this.http.get<Array<any>>(`/editor/${this.route.snapshot.paramMap.get('groupName')}/content/forms.json`).toPromise()
    const updatedFormsJson = formsJson.map(formInfo => {
      if (formInfo.id !== state.form.id) return Object.assign({}, formInfo)
      return Object.assign({}, formInfo, {
        title: state.form.title
      })
    })
    files.push({
      groupId: this.route.snapshot.paramMap.get('groupName'),
      filePath:`./forms.json`,
      fileContents: JSON.stringify(updatedFormsJson)
    })
    // Update form.html.
    files.push({
      groupId: this.route.snapshot.paramMap.get('groupName'),
      filePath:`./${state.form.id}/form.html`,
      fileContents: formHtml 
    })
    // Send to server.
    for (let file of files) {
      await this.http.post('/editor/file/save', file).toPromise()
    }
  }

}
