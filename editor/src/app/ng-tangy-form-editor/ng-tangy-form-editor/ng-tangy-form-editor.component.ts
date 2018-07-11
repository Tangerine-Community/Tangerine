import { AfterContentInit, ElementRef, Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ArrayType } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-ng-tangy-form-editor',
  templateUrl: './ng-tangy-form-editor.component.html',
  styleUrls: ['./ng-tangy-form-editor.component.css']
})
export class NgTangyFormEditorComponent implements AfterContentInit {

  @ViewChild('editor') editorElRef: ElementRef;
  @ViewChild('form') formContainerElRef: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) { }

  async ngAfterContentInit() {
    let formId = this.route.snapshot.paramMap.get('formId');
    let groupName = this.route.snapshot.paramMap.get('groupName');
    let tangyFormEditorEl = this.editorElRef.nativeElement 
    let tangyFormContainerEl = this.formContainerElRef.nativeElement 
    let formsJson = await this.http.get<Array<any>>(`/editor/${groupName}/content/forms.json`).toPromise()
    let formInfo = formsJson.find(formInfo => formInfo.id === formId)
    let formHtml = await this.http.get(`/editor/${groupName}/content/${formId}/form.html`, {responseType: 'text'}).toPromise()
    tangyFormContainerEl.innerHTML = formHtml
    let itemsProps = [].slice.call(tangyFormContainerEl.querySelectorAll('tangy-form-item')).map(el => el.getProps())
    let items = []
    for (let itemProps of itemsProps) {
      itemProps.fileContents = await this.http.get(`/editor/${groupName}/content/${itemProps.src.replace('\/assets', '')}`, {responseType: 'text'}).toPromise()
      items.push(itemProps)
    }
    // Open the form.
    setTimeout(() => {
      tangyFormEditorEl.store.dispatch({
        type: 'FORM_OPEN',
        payload: {
          editMode: 'ckeditor', 
          openItem: '',
          form: {
            id: formInfo.id,
            title: formInfo.title
          },
          items: [
            ...items,
          ]
        }
      })
      tangyFormEditorEl.store.subscribe(state => this.saveFiles())
    }, 1000)
    
  }

  async saveFiles() {
    let files = []
    let state = this.editorElRef.nativeElement.store.getState()
    files.push({
      groupId: this.route.snapshot.paramMap.get('groupName'),
      filePath:`./${state.form.id}/form.html`,
      fileContents: `
        <tangy-form id="${state.form.id}">
          ${state.items.map(item => `
            <tangy-form-item id="${item.id}" src="./assets/${state.form.id}/${item.id}.html" title="${item.title}"${(item.hideBackButton) ? ` hide-back-button` : ''}${(item.summary) ? ` summary` : ``}${(item.rightToLeft) ? ` right-to-left` : ''}></tangy-form-item>
          `).join('')}
        </tangy-form>
      `
    })
    state.items.forEach(item => {
      files.push({
        groupId: this.route.snapshot.paramMap.get('groupName'),
        filePath: `./${state.form.id}/${item.id}.html`,
        fileContents: item.fileContents
      })
    })
    for (let file of files) {
      await this.http.post('/editor/file/save', file).toPromise()
    }
  }

}
