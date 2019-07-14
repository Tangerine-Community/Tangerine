import { Component, OnInit } from '@angular/core';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { QueriesService } from '../../services/queries.service';


@Component({
  selector: 'app-case-home',
  templateUrl: './case-home.component.html',
  styleUrls: ['./case-home.component.css']
})

export class CaseHomeComponent implements OnInit {
  showQueries = true;
  openQueriesCount = 0;

  constructor(
    private appConfig: AppConfigService,
    private queriesService: QueriesService
    ) { }

  async ngOnInit() {
    const config = await this.appConfig.getAppConfig();
    this.showQueries = config.showQueries
    if (this.showQueries) {
      this.openQueriesCount = await this.queriesService.getOpenQueriesCount();
     }
  }

}
