import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { GroupsService } from '../services/groups.service';
import { TangerineFormsService } from '../services/tangerine-forms.service';

@Component({
  selector: 'app-csv-data-set-detail',
  templateUrl: './csv-data-set-detail.component.html',
  styleUrls: ['./csv-data-set-detail.component.css']
})
export class CsvDataSetDetailComponent implements OnInit, OnDestroy {
  breadcrumbs: Array<Breadcrumb> = [
    <Breadcrumb>{
      label: _TRANSLATE('Download CSV Data Set'),
      url: 'csv-data-sets'
    }]
  title = _TRANSLATE('View CSV Data Set Details')
  groupId;
  datasetId
  datasetDetail
  displayedColumns = ['formTitle','csvTemplateTitle','inProgress','outputPath']
  detailInterval:any
  constructor(
    private route: ActivatedRoute,
    private formService: TangerineFormsService,
    private groupsService: GroupsService
  ) { 
    this.datasetId = this.route.snapshot.paramMap.get('dataSetId')
    this.groupId = this.route.snapshot.paramMap.get('groupId')
    this.breadcrumbs = [
      ...this.breadcrumbs,
      <Breadcrumb>{
        label: _TRANSLATE('View CSV Data Set Details'),
        url: `csv-data-sets/${this.datasetId}`
      }
    ]
  }

  async ngOnInit(){
    await this.getDatasetDetail()
    this.detailInterval = setInterval(() => this.getDatasetDetail, 15*1000)
    if(this.datasetDetail.complete){
      clearInterval(this.detailInterval)
    }
  }

  ngOnDestroy() {
    clearInterval(this.detailInterval)
  }

  async getDatasetDetail(){
    const datasetDetail = await this.groupsService.getDatasetDetail(this.datasetId)
    const csvTemplates = await this.formService.listCsvTemplates(this.groupId)
    const formsInfo = await this.formService.getFormsInfo(this.groupId)

    datasetDetail['csvs'] = datasetDetail['csvs'].map(csv =>{return {
      ...csv,
      csvTemplateTitle: csvTemplates.find(t => t._id === csv.csvTemplateId)?.title || _TRANSLATE('All data'),
      formTitle: formsInfo.find(f => f.id === csv.formId)?.title || csv.formId
    }})
    this.datasetDetail = datasetDetail
  }

}
