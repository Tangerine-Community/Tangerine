import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { ServerConfigService } from 'src/app/shared/_services/server-config.service';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { GroupsService } from '../services/groups.service';
import { TangerineFormsService } from '../services/tangerine-forms.service';

@Component({
  selector: 'app-new-csv-data-set',
  templateUrl: './new-csv-data-set.component.html',
  styleUrls: ['./new-csv-data-set.component.css']
})
export class NewCsvDataSetComponent implements OnInit {
  title = _TRANSLATE('New CSV Data Set')
  breadcrumbs: Array<Breadcrumb> = [
    <Breadcrumb>{
      label: _TRANSLATE('Download CSV Data Set'),
      url: 'csv-data-sets'
    }]

  months = []
  years = []
  selectedMonth = '*'
  selectedYear = '*'
  selectedForms = []
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
    private errorHandler: TangyErrorHandler) {
    this.breadcrumbs = [
      ...this.breadcrumbs,
      <Breadcrumb>{
        label: _TRANSLATE('New CSV Data Set'),
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
    const config = await this.serverConfig.getServerConfig()
    const appendedForms = [
      {id: 'participant',title:_TRANSLATE('Participant')},
      {id: 'event-form',title:_TRANSLATE('Event Form')},
      {id: 'case-event',title: _TRANSLATE('Case Event')}]
    this.forms = (await this.formsService.getFormsInfo(this.groupId));
    if(config.enabledModules.includes('case')){
      this.forms = [...this.forms, ...appendedForms]
    }
    this.activeForms = this.forms.filter(form => !form.archived);
    this.archivedForms = this.forms.filter(form => form.archived);
  }

  async process() {
    const forms = this.selectedForms.toString()
    if ((this.selectedMonth === '*' && this.selectedYear !== '*') || (this.selectedMonth !== '*' && this.selectedYear === '*')) {
      alert('You must choose a month and a year.')
      return
    }
    try {
      const result: any = await this.groupsService.downloadCSVDataSet(this.groupId, forms, this.selectedYear, this.selectedMonth, this.excludePII);
      console.log(result)
      this.stateUrl = result.stateUrl;
      this.router.navigate([`../`], { relativeTo: this.route })
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

}
