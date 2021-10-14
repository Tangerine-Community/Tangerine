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

  title = _TRANSLATE('CSV Template')
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
        const allHeaders = (await this.formsService.getCsvHeaders(this.groupId, this.formId)).map(headerInfo => headerInfo.header)
        this.removedHeaders = allHeaders.filter(header => !this.headers.includes(header))
      }
      this.formsInfo = await this.formsService.getFormsInfo(this.groupId)
      this.breadcrumbs = [
        <Breadcrumb>{
          label: _TRANSLATE('CSV Templates'),
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
    this.headers = (await this.formsService.getCsvHeaders(this.groupId, this.formId)).map(headerInfo => headerInfo.header)
  }

  async onSubmit() {
    await this.formsService.updateCsvTemplate(this.groupId, {
      ...this.csvTemplate,
      formId: this.formId,
      headers: this.headers,
      title: this.csvTemplateTitle
    })
    this.router.navigate(['..'], {relativeTo: this.route})
  }

}
