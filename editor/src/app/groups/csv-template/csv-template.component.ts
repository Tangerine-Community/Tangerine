import { CsvTemplate, TangerineFormsService } from './../services/tangerine-forms.service';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import { GroupsService } from '../services/groups.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TangerineFormInfo } from 'src/app/shared/_classes/tangerine-form.class';


@Component({
  selector: 'app-csv-template',
  templateUrl: './csv-template.component.html',
  styleUrls: ['./csv-template.component.css']
})
export class CsvTemplateComponent implements OnInit {

  title = _TRANSLATE('Spreadsheet Template')
  breadcrumbs:Array<Breadcrumb> = []

  formId:string
  csvTemplateTitle

  groupId:string
  formsInfo:Array<TangerineFormInfo>

  csvTemplate:CsvTemplate = {
    _id: '',
    title: '',
    formId: '',
    headers: []
  }

  headers = []
  removedHeaders = []

  constructor(
    private groupsService: GroupsService,
    private route: ActivatedRoute,
    private router: Router,
    private formsService: TangerineFormsService
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.groupId = params['groupId'];
      this.csvTemplate = await this.formsService.readCsvTemplate(this.groupId, params['csvTemplateId'])
      this.csvTemplateTitle = this.csvTemplate.title
      this.formId = this.csvTemplate.formId
      this.headers = this.csvTemplate.headers
      if (this.formId) {
        try {
          let headerInfos = await this.formsService.getCsvHeaders(this.groupId, this.formId);
          const allHeaders = headerInfos.map(headerInfo => headerInfo.header)
          this.removedHeaders = allHeaders.filter(header => !this.headers.includes(header))
        } catch (e) {
          console.log("No header doc for this form. ")
        }
        
      }
      this.formsInfo = await this.formsService.getFormsInfo(this.groupId)
      this.breadcrumbs = [
        <Breadcrumb>{
          label: 'Spreadsheet Templates',
          url: 'csv-templates'
        },
        <Breadcrumb>{
          label: this.csvTemplate.title,
          url: `csv-templates/${params.csvTemplateId}`
        }
      ]
    });
  }

  headerUp(header) {
    const indexOfHeader = this.headers.indexOf(header)
    const headerAbove = this.headers[indexOfHeader - 1]
    this.headers = [
      ...this.headers.slice(0, indexOfHeader - 1),
      this.headers[indexOfHeader],
      headerAbove,
      ...this.headers.slice(indexOfHeader + 1, 999999999),
    ]
  }

  headerDown(header) {
    const indexOfHeader = this.headers.indexOf(header)
    const headerBelow = this.headers[indexOfHeader + 1]
    this.headers = [
      ...this.headers.slice(0, indexOfHeader === 0 ? 0 : indexOfHeader),
      headerBelow,
      header,
      ...this.headers.slice(indexOfHeader + 2),
    ]
  }

  headerRemove(headerToRemove) {
    this.removedHeaders = [
      ...this.removedHeaders,
      ...this.headers.filter(header => header === headerToRemove)
    ]
    this.headers = this.headers.filter(header => header !== headerToRemove)
  }

  headerAdd(headerToAdd) {
    this.headers = [
      ...this.headers,
      ...this.removedHeaders.filter(header => header === headerToAdd)
    ]
    this.removedHeaders = this.removedHeaders.filter(header => header !== headerToAdd)
  }

  async onFormIdSelect($event) {
    try {
      let headerInfos = await this.formsService.getCsvHeaders(this.groupId, this.formId);
      this.headers = headerInfos.map(headerInfo => headerInfo.header)
    } catch (e) {
      alert(_TRANSLATE('No headers for this form - may be no records uploaded yet.'))
    }
  }
  
  async onSubmit() {
    if (!this.csvTemplateTitle && !this.formId) {
      alert(_TRANSLATE('Please title this template and select a form to use it with.'))
      return
    }
    else if (!this.csvTemplateTitle) {
      alert(_TRANSLATE('Title is required.'))
      return
    }
    else if (!this.formId) {
      alert(_TRANSLATE('Please select a form to use as a template.'))
      return
    }
    await this.formsService.updateCsvTemplate(this.groupId, {
      ...this.csvTemplate,
      formId: this.formId,
      headers: this.headers,
      title: this.csvTemplateTitle
    })
    this.router.navigate(['..'], {relativeTo: this.route})
  }

}
