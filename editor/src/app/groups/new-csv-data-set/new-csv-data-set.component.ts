import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TangerineFormInfo } from 'src/app/shared/_classes/tangerine-form.class';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { ServerConfigService } from 'src/app/shared/_services/server-config.service';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { GroupsService } from '../services/groups.service';
import { TangerineFormsService } from '../services/tangerine-forms.service';
import {AppConfig} from "../../../../../client/src/app/shared/_classes/app-config.class";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-new-csv-data-set',
  templateUrl: './new-csv-data-set.component.html',
  styleUrls: ['./new-csv-data-set.component.css']
})
export class NewCsvDataSetComponent implements OnInit {
  title = _TRANSLATE('Request Spreadsheets')
  breadcrumbs: Array<Breadcrumb> = [
    <Breadcrumb>{
      label: _TRANSLATE('Spreadsheet Requests'),
      url: 'csv-data-sets'
    }]

  templateSelections:any = {}
  months = []
  years = []
  description
  selectedMonth = '*'
  selectedYear = '*'
  selectedForms = []
  allFormsSelected = false
  groupId = ''
  forms
  activeForms
  archivedForms
  excludePII
  stateUrl
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formsService: TangerineFormsService,
    private groupsService:GroupsService,
    private serverConfig: ServerConfigService,
    private http: HttpClient,
    private errorHandler: TangyErrorHandler) {
    this.breadcrumbs = [
      ...this.breadcrumbs,
      <Breadcrumb>{
        label: this.title,
        url: 'csv-data-sets/new'
      },
    ]
    this.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 0; i < 10; i++) {
      this.years = [new Date().getFullYear() - i, ...this.years]
    }
    this.years = this.years.reverse()
  }

  async ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('groupId')

    try {
      await this.getForms();
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
    }
  }

  async getForms() {
    const csvTemplates = (await this.formsService.listCsvTemplates(this.groupId))
    const config = await this.serverConfig.getServerConfig()
    const appConfig = <AppConfig>await this.http.get('./assets/app-config.json').toPromise()
    
    let forms = await this.formsService.getFormsInfo(this.groupId)
    if (appConfig.teachProperties?.useAttendanceFeature) {
      const attendanceForms = <Array<TangerineFormInfo>>[
        {id: 'attendance', title: _TRANSLATE('Attendance')},
        {id: 'behavior', title: _TRANSLATE('Behavior')},
        {id: 'scores', title: _TRANSLATE('Scores')}
      ]
      forms = [...forms, ...attendanceForms]
    }
    if (config.enabledModules.includes('case')) {
      const caseForms = <Array<TangerineFormInfo>>[
        {id: 'participant', title: _TRANSLATE('Participant')},
        {id: 'event-form', title: _TRANSLATE('Event Form')},
        {id: 'case-event', title: _TRANSLATE('Case Event')}]
      forms = [...forms, ...caseForms]
    }
    this.forms = forms.map(form => {
      return {
        ...form,
        csvTemplates: csvTemplates.filter(template => template.formId === form.id)
      }
    })
    this.templateSelections = this.forms.reduce((templateSelections, form) => {
      return {
        ...templateSelections,
        [form.id]: ''
      }
    })
    this.activeForms = this.forms.filter(form => !form.archived);
    this.archivedForms = this.forms.filter(form => form.archived);
  }
  
  async process() {
    const forms = this.selectedForms
      .map(formId => this.templateSelections[formId] ? `${formId}:${this.templateSelections[formId]}` : formId)
      .toString()
    if ((this.selectedMonth === '*' && this.selectedYear !== '*') || (this.selectedMonth !== '*' && this.selectedYear === '*')) {
      alert('You must choose a month and a year.')
      return
    }
    try {
      const result: any = await this.groupsService.downloadCSVDataSet(this.groupId, forms, this.selectedYear, this.selectedMonth, this.description, this.excludePII);
      this.stateUrl = result.stateUrl;
      this.router.navigate(['../', result.id], { relativeTo: this.route })
    } catch (error) {
      console.log(error);
    }
  }

  onFormCheckBoxChange(formId, input){
    if(input.checked){
      this.selectedForms = [...this.selectedForms, formId]
    } else{
      this.selectedForms = this.selectedForms.filter(e=>e!==formId)
    }
  }

  toggleSelectAllForms(input){
    this.allFormsSelected = !this.allFormsSelected
    if(input.checked){
      this.selectedForms = this.forms.map(form=>form.id)
    } else{
      this.selectedForms = []
    }
  }

}
