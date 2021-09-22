import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { CsvTemplate, TangerineFormsService } from '../services/tangerine-forms.service';

@Component({
  selector: 'app-group-csv-templates',
  templateUrl: './group-csv-templates.component.html',
  styleUrls: ['./group-csv-templates.component.css']
})
export class GroupCsvTemplatesComponent implements OnInit {

  title = _TRANSLATE('CSV Templates')
  breadcrumbs:Array<Breadcrumb> = [
    <Breadcrumb>{
      label: _TRANSLATE('CSV Templates'),
      url: 'csv-templates'
    }
  ]

  csvTemplates:Array<any> = []
  groupId:string

  constructor(
    private formsService: TangerineFormsService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.groupId = params['groupId']
      this.listCsvTemplates()
    })
  }

  async listCsvTemplates() {
    const formsInfo = await this.formsService.getFormsInfo(this.groupId)
    const csvTemplates = await this.formsService.listCsvTemplates(this.groupId)
    csvTemplates.forEach(template => delete template['_rev'])
    this.csvTemplates = csvTemplates.map(csvTemplate => { return {
      "_id": csvTemplate._id,
      "Template Title": csvTemplate.title,
      "Form": formsInfo.find(formInfo => formInfo.id === csvTemplate.formId).title,
      "Columns": csvTemplate.headers
    }})
  }

  async createCsvTemplate() {
    const csvTemplate = await this.formsService.createCsvTemplate(this.groupId)
    this.router.navigate([csvTemplate._id], {relativeTo: this.route})
  }

  async onRowEdit($event) {
    this.router.navigate([$event._id], {relativeTo: this.route})
  }

  async onRowDelete($event) {
    const status = await this.formsService.deleteCsvTemplate(this.groupId, $event._id)
    this.listCsvTemplates()
  }

}
