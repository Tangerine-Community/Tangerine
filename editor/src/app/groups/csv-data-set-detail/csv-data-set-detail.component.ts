import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { GroupsService } from '../services/groups.service';

@Component({
  selector: 'app-csv-data-set-detail',
  templateUrl: './csv-data-set-detail.component.html',
  styleUrls: ['./csv-data-set-detail.component.css']
})
export class CsvDataSetDetailComponent implements OnInit {
  breadcrumbs: Array<Breadcrumb> = [
    <Breadcrumb>{
      label: _TRANSLATE('Download CSV Data Set'),
      url: 'csv-data-sets'
    }]
  title = _TRANSLATE('View CSV Data Set Details')
  groupId;
  datasetId
  datasetDetail
  displayedColumns = ['formId','inProgress','outputPath']
  constructor(
    private route: ActivatedRoute,
    private groupsService: GroupsService
  ) { 
    this.datasetId = this.route.snapshot.paramMap.get('dataSetId')
    this.breadcrumbs = [
      ...this.breadcrumbs,
      <Breadcrumb>{
        label: _TRANSLATE('View CSV Data Set Details'),
        url: `csv-data-sets/${this.datasetId}`
      }
    ]
  }

  async ngOnInit(){
     this.datasetDetail = await this.groupsService.getDatasetDetail(this.datasetId)
  }

}
