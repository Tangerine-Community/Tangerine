import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { GroupsService } from '../services/groups.service';
import { TangerineFormsService } from '../services/tangerine-forms.service';

@Component({
  selector: 'app-release-online-survey',
  templateUrl: './release-online-survey.component.html',
  styleUrls: ['./release-online-survey.component.css']
})
export class ReleaseOnlineSurveyComponent implements OnInit {
  title = _TRANSLATE('Release Survey');
  breadcrumbs: Array<Breadcrumb> = [];
  groupId;
  forms;
  group;
  publishedSurveys;
  unPublishedSurveys;
  constructor(private route: ActivatedRoute,
    private groupService: GroupsService,
    private errorHandler: TangyErrorHandler,
    private tangyFormService: TangerineFormsService) { }

  async ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Release Online Survey'),
        url: 'onlineSurvey'
      }
    ];
    await this.getForms();
  }

  async getForms() {
    const forms = await this.tangyFormService.getFormsInfo(this.groupId);
    this.group = await this.groupService.getGroupInfo(this.groupId);
    const groupOnlineSurveys = this.group?.onlineSurveys ?? [];
    const surveyData = forms.map(f => {
      const survey = groupOnlineSurveys.find(s => f.id === s.formId) || {};
      return { ...f, ...survey };
    });
    this.publishedSurveys = surveyData.filter(e => e.published);
    this.unPublishedSurveys = surveyData.filter(e => !e.published);
  }
  async publishSurvey(formId, appName) {
    try {
      await this.groupService.publishSurvey(this.groupId, formId, 'prod', appName);
      await this.getForms();
      this.errorHandler.handleError(_TRANSLATE('Survey Published Successfully.'));
    } catch (error) {
      console.error(error);
      this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
    }
  }
  async unPublishSurvey(formId) {
    try {
      await this.groupService.unPublishSurvey(this.groupId, formId);
      await this.getForms();
      this.errorHandler.handleError(_TRANSLATE('Survey UnPublished Successfully.'));
    } catch (error) {
      console.error(error);
      this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
    }
  }

}
