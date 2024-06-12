import { Component, OnInit } from '@angular/core';
import { AppConfigService } from './shared/_services/app-config.service';
import { CaseService } from './case/services/case.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  languageDirection: string;
  appName: string;
  hasHelpLink: boolean = false;
  helpLink: string;
  window: any;

  constructor(private appConfigService: AppConfigService, private caseService: CaseService){
  }

  async ngOnInit(): Promise<any>{
    try {
      const appConfig = await this.appConfigService.getAppConfig();
      this.appName = appConfig.appName;
      this.languageDirection = appConfig.languageDirection;

      if (appConfig.helpLink) {
        this.hasHelpLink = true;
        this.helpLink = appConfig.helpLink;
      }

    } catch (error) {
      this.appName = '';
      this.languageDirection = 'ltr';
    }
  }
}
