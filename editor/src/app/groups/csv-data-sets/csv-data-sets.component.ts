import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { GroupsService } from '../services/groups.service';

@Component({
  selector: 'app-csv-data-sets',
  templateUrl: './csv-data-sets.component.html',
  styleUrls: ['./csv-data-sets.component.css']
})
export class CsvDataSetsComponent implements OnInit {
  title = _TRANSLATE('Download CSV Data Set')
  breadcrumbs: Array<Breadcrumb> = []
  csvDataSets;
  displayedColumns = ['fileName', 'month', 'year', 'dateCreated', 'status', 'downloadUrl']
  groupId
  pageIndex = 1
  pageSize = 5
  constructor(
    private groupsService: GroupsService,
    private errorHandler: TangyErrorHandler,
    private route: ActivatedRoute
  ) {
    this.groupId = this.route.snapshot.paramMap.get('groupId')
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Download CSV Data Set'),
        url: 'csv-data-sets'
      }
    ]
  }

  async ngOnInit() {
    await this.getData()
  }

  async onPageChange(event){
    this.pageIndex = event.pageIndex
    this.pageSize = event.pageSize
    await this.getData()
  }

  async getData(){
    try {
      this.csvDataSets = await this.groupsService.listCSVDataSets(this.groupId, this.pageIndex, this.pageSize)
      
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'))
    }
  }

}
