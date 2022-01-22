import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { GroupsService } from '../services/groups.service';
import { TangerineFormsService } from '../services/tangerine-forms.service';
import { DatePipe } from '@angular/common';
import { ProcessMonitorService } from 'src/app/shared/_services/process-monitor.service';

@Component({
  selector: 'app-csv-data-set-detail',
  templateUrl: './csv-data-set-detail.component.html',
  styleUrls: ['./csv-data-set-detail.component.css']
})
export class CsvDataSetDetailComponent implements OnInit, OnDestroy {
  breadcrumbs: Array<Breadcrumb> = [
    <Breadcrumb>{
      label: _TRANSLATE('Spreadsheet Requests'),
      url: 'csv-data-sets'
    }]
  title = '' 
  groupId;
  datasetId
  datasetDetail
  displayedColumns = ['formTitle','csvTemplateTitle','inProgress','outputPath']
  detailInterval:any
  stopPolling = false
  constructor(
    private route: ActivatedRoute,
    private formService: TangerineFormsService,
    private processMonitor: ProcessMonitorService,
    private groupsService: GroupsService
  ) { 
    this.datasetId = this.route.snapshot.paramMap.get('dataSetId')
    this.groupId = this.route.snapshot.paramMap.get('groupId')
  }

  async ngOnInit(){
    const process = this.processMonitor.start('csv-data-set-detail', 'Loading details...')
    await this.getDatasetDetail()
    this.processMonitor.stop(process.id)
  }

  ngOnDestroy(){
    this.stopPolling = true
  }

  async getDatasetDetail(){
    const datasetDetail = <any>await this.groupsService.getDatasetDetail(this.datasetId)
    const datePipe = new DatePipe('en-US')
    if (!this.title) {
      this.title = `Spreadsheets requested on ${datePipe.transform(datasetDetail.dateCreated, 'medium')}`
      this.breadcrumbs = [
        ...this.breadcrumbs,
        <Breadcrumb>{
          label: this.title,
          url: `csv-data-sets/${this.datasetId}`
        }
      ]
    }
    const csvTemplates = await this.formService.listCsvTemplates(this.groupId)
    const formsInfo = await this.formService.getFormsInfo(this.groupId)
    datasetDetail['csvs'] = datasetDetail['csvs'].map(csv =>{return {
      ...csv,
      csvTemplateTitle: csvTemplates.find(t => t._id === csv.csvTemplateId)?.title || _TRANSLATE('All data'),
      formTitle: formsInfo.find(f => f.id === csv.formId)?.title || csv.formId
    }})
    this.datasetDetail = datasetDetail
    if(!this.datasetDetail.complete && !this.stopPolling){
      setTimeout(() => this.getDatasetDetail(), 5*1000)
    }
  }

}
