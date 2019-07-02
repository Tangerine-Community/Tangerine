import { Component, OnInit } from '@angular/core';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';


@Component({
  selector: 'app-case-home',
  templateUrl: './case-home.component.html',
  styleUrls: ['./case-home.component.css']
})
export class CaseHomeComponent implements OnInit {
  showQueries = true;

  constructor(
    private appConfig: AppConfigService
    ) { }

  async ngOnInit() {
    const config = await this.appConfig.getAppConfig();
    this.showQueries = config.showQueries
  }

}
