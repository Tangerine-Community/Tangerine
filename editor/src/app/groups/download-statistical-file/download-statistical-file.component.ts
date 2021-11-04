import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WindowRef } from 'src/app/core/window-ref.service';
import { _TRANSLATE } from 'src/app/shared/translation-marker';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { GroupsService } from '../services/groups.service';
import { TangerineFormsService } from '../services/tangerine-forms.service';

@Component({
  selector: 'app-download-statistical-file',
  templateUrl: './download-statistical-file.component.html',
  styleUrls: ['./download-statistical-file.component.css']
})
export class DownloadStatisticalFileComponent implements OnInit {

  title = _TRANSLATE('Download Statistical Files')
  breadcrumbs:Array<Breadcrumb> = []

  forms;
  groupId;
  group;
  groupLabel;
  archivedForms;
  activeForms;
  groupUrl;
  formsJsonURL;
  headers
  constructor(
    private route: ActivatedRoute,
    private windowRef: WindowRef,
    private groupsService: GroupsService,
    private tangerineForms: TangerineFormsService,
    private errorHandler: TangyErrorHandler,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Download Statistical Files'),
        url: 'download-statistical-files'
      }
    ]
    this.route.params.subscribe(async params => {
      this.groupId = params.groupId;
      this.group = await this.groupsService.getGroupInfo(this.groupId);
      this.groupLabel = this.group.label;
      this.formsJsonURL = `./forms.json`;
    });
    try {
      await this.getForms();
      this.groupUrl = `${this.windowRef.nativeWindow.location.origin}${this.windowRef.nativeWindow.location.pathname}`;
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
    }
  }


  async getForms() {
    this.forms = await this.tangerineForms.getFormsInfo(this.groupId) as [];
    this.activeForms = this.forms.filter(form => !form.archived);
    this.archivedForms = this.forms.filter(form => form.archived);
  }

  async createFormDataStructure(formId){
    this.headers = [...(await this.groupsService.getFormHeaders(this.groupId, formId)) as []].map(e=>e['key']).toString();
    const formHtml = await this.http.get(`/editor/${this.groupId}/content/${formId}/form.html`, { responseType: 'text' }).toPromise();
    const domFromFromHTML = Array.from(document.createRange().createContextualFragment(formHtml).querySelectorAll('template'))
    const structure = domFromFromHTML.flatMap(e=>{
      return Array.from(e.content.children).map(el=>{
        let obj ={ name: el.getAttribute('name'), label: el.getAttribute('label'??'' ), type: el.getAttribute('type'?? undefined )}
        if(el.tagName==='TANGY-RADIO-BUTTONS'|| el.tagName==='TANGY-SELECT'||el.tagName==='TANGY-CHECKBOXES'||el.tagName==='TANGY-TIMED'||el.tagName==='TANGY-UNTIMED'){
          obj['options'] = [...Array.from(el.children).map(c=>({value:c.getAttribute('value'), label:c['label']}))]
        }
        return obj;
      })
    })
    return structure;
  }
  async getStataDoFile(formId){
    const structure = await this.createFormDataStructure(formId)
    const labelDefines = structure.map(item=>{
      let optionString = ""
      item['options'] && item['options'].forEach(e=>optionString+=`${e.value} "${e.label}"`)
      return item['options'] && `label define ${item.name}_  ${optionString}\n`}).join('')
    const labelValues = structure.map( item => `label values ${item.name} ${item.name}_\n`).join('')
    const dateReplace = structure.map(item=>{
      if(item.type==='date'){
        return`
tostring ${item.name}, replace
gen _date_ = date(${item.name},"YMD")
drop ${item.name}
rename _date_ ${item.name}
format ${item.name} %dM_d,_CY\n
    `
      } else{
        return ''
      }
    }).join('')
    const labelVariables = structure.map(item =>`label variable ${item.name} "${item.label??''}"\n`).join('')
    const stataTemplate = `
/* please enter the label for your dataset and the correct path/filename to the csv file*/
version 13
clear

import delimited ${this.headers} using "enter-filename-here.csv" , varnames(nonames)

label data "enter-label-for-your-dataset"

${labelDefines}
${labelValues}

${dateReplace}
${labelVariables}


order ${this.headers}
set more off
describe
    
    `
    const formName = this.forms.find(f=>f.id===formId).title
    const file = new Blob([stataTemplate], {type: 'text/plain'});
    this.downloadData(file, `${this.groupLabel}-${formName}.do`, 'text/plain');
    
  }
  
  downloadData(content, fileName, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = fileName;
    a.click();
  }
}
