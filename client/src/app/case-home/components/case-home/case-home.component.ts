import { Component, OnInit } from '@angular/core';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { CaseService } from '../../../case/services/case.service';

@Component({
  selector: 'app-case-home',
  templateUrl: './case-home.component.html',
  styleUrls: ['./case-home.component.css']
})
export class CaseHomeComponent implements OnInit {

  showQueries = true;
  showCaseReports = false
  showIssues = false
  openQueriesCount = 0;

  constructor(
    private appConfig: AppConfigService,
    private caseService: CaseService
  ) {
  }

  async ngOnInit() {
    const config = await this.appConfig.getAppConfig();
    this.showQueries = config.showQueries;
    this.showCaseReports = config.showCaseReports
    this.showIssues = config.showIssues
    if (this.showQueries) {
      this.openQueriesCount = await this.caseService.getOpenQueriesCount();
     }
    }
  }


