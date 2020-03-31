import { Component, OnInit } from '@angular/core';
import { GroupsService } from '../services/groups.service';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';

@Component({
  selector: 'app-case-settings',
  templateUrl: './case-settings.component.html',
  styleUrls: ['./case-settings.component.css']
})
export class CaseSettingsComponent implements OnInit {
  allowDeleteIfFormNotStarted = false;
  allowDeleteIfFormNotCompleted = false;
  appConfig;
  groupId;
  title = _TRANSLATE('Case Settings')
  breadcrumbs: Array<Breadcrumb> = []
  constructor(private route: ActivatedRoute, private groupsService: GroupsService,
    private appConfigService: AppConfigService, private errorHandler: TangyErrorHandler) { }
  async ngOnInit() {
    this.breadcrumbs = [];
    this.route.params.subscribe(async params => {
      this.groupId = params.groupId;
    });
    this.appConfig = await this.appConfigService.getAppConfig(this.groupId);
    this.allowDeleteIfFormNotCompleted = !!this.appConfig.allowDeleteIfFormNotCompleted;
    this.allowDeleteIfFormNotStarted = !!this.appConfig.allowDeleteIfFormNotStarted;
  }
  async save() {
    try {
      this.appConfig.allowDeleteIfFormNotCompleted = !!this.allowDeleteIfFormNotCompleted;
      this.appConfig.allowDeleteIfFormNotStarted = !!this.allowDeleteIfFormNotStarted;
      console.log(this.appConfig);
      await this.groupsService.saveFileToGroupDirectory(this.groupId, this.appConfig, './app-config.json');
      this.errorHandler.handleError(_TRANSLATE('User Created Succesfully'));
    } catch (error) {
      this.errorHandler.handleError(_TRANSLATE('Could not save settings'));
      console.log(error);
    }
  }
}
