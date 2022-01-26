import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { GroupsService } from '../services/groups.service';
import { ProcessMonitorService } from 'src/app/shared/_services/process-monitor.service';

@Component({
  selector: 'app-csv-data-sets',
  templateUrl: './csv-data-sets.component.html',
  styleUrls: ['./csv-data-sets.component.css']
})
export class CsvDataSetsComponent implements OnInit, OnDestroy {
  title = _TRANSLATE('Spreadsheet Requests')
  breadcrumbs: Array<Breadcrumb> = []
  csvDataSets;
  displayedColumns = ['dateCreated', 'description', 'month', 'year', 'status', 'numberOfSpreadsheets', 'details', 'downloadUrl']
  groupId
  pageIndex = 0
  pageSize = 5
  refreshTimeout:any
  numberOfDatasets = 0
  ready = false
  stopPolling = false
  constructor(
    private groupsService: GroupsService,
    private errorHandler: TangyErrorHandler,
    private processMonitorService: ProcessMonitorService,
    private route: ActivatedRoute
  ) {
    this.groupId = this.route.snapshot.paramMap.get('groupId')
    this.breadcrumbs = [
      <Breadcrumb>{
        label: this.title,
        url: 'csv-data-sets'
      }
    ]
  }

  async ngOnInit() {
    const process = this.processMonitorService.start('csv-data-sets', 'Loading Spreadsheet Requests...')
    await this.getData()
    this.processMonitorService.stop(process.id)
  }

  ngOnDestroy() {
    this.stopPolling = true
    clearTimeout(this.refreshTimeout)
  }

  async onPageChange(event){
    const process = this.processMonitorService.start('csv-data-sets', 'Loading Spreadsheet Requests...')
    this.ready = false
    clearTimeout(this.refreshTimeout)
    this.pageIndex = event.pageIndex
    this.pageSize = event.pageSize
    await this.getData()
    this.ready = true
    this.processMonitorService.stop(process.id)
  }

  async getData(){
    try {
      const datasetsInfo = <any>await this.groupsService.listCSVDataSets(this.groupId, this.pageIndex, this.pageSize)
      this.numberOfDatasets = datasetsInfo.numberOfDatasets
      this.csvDataSets = datasetsInfo.datasets.map(csvDataSet => {
        csvDataSet.formIds = csvDataSet.state?.formIds || []
        csvDataSet.month = csvDataSet.month === '*' ? 'All months' : csvDataSet.month
        csvDataSet.year = csvDataSet.year === '*' ? 'All years' : csvDataSet.year
        return csvDataSet
      })
      if (this.csvDataSets.find(csvDataSet => csvDataSet.status === 'In progress') && !this.stopPolling) {
        this.refreshTimeout = setTimeout(() => this.getData(), 10 * 1000)
      }
      this.ready = true
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'))
    }
  }

}
