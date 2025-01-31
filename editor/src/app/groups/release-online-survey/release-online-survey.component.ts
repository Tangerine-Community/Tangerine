import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { TangyErrorHandler } from 'src/app/shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { GroupsService } from '../services/groups.service';
import { TangerineFormsService } from '../services/tangerine-forms.service';
import { ProcessMonitorService } from 'src/app/shared/_services/process-monitor.service';
import { ProcessMonitorDialogComponent } from 'src/app/shared/_components/process-monitor-dialog/process-monitor-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
  dialogRef:any

  constructor(private route: ActivatedRoute,
    private groupService: GroupsService,
    private errorHandler: TangyErrorHandler,
    private tangyFormService: TangerineFormsService,
    private processMonitorService: ProcessMonitorService,
    private dialog: MatDialog,
  ) { }

  async ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    this.breadcrumbs = [
      <Breadcrumb>{
        label: _TRANSLATE('Release Online Survey'),
        url: 'onlineSurvey'
      }
    ];
    this.processMonitorService.change.subscribe((isDone) => {
      if (this.processMonitorService.processes.length === 0) {
        this.dialog.closeAll()
      } else {
        this.dialog.closeAll()
        this.dialogRef = this.dialog.open(ProcessMonitorDialogComponent, {
          data: {
            messages: this.processMonitorService.processes.map(process => process.description).reverse()
          },
          disableClose: true
        })
      }
    })

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
    this.publishedSurveys = surveyData.filter(e => e.published && e.type == "form");
    this.unPublishedSurveys = surveyData.filter(e => !e.published && e.type == "form");
  }
  async publishSurvey(formId, appName, locked) {
    const process = this.processMonitorService.start('publishSurvey', 'Publishing Survey');

    try {
      await this.groupService.publishSurvey(this.groupId, formId, 'prod', appName, locked);
      await this.getForms();
      this.errorHandler.handleError(_TRANSLATE('Survey Published Successfully.'));
    } catch (error) {
      console.error(error);
      this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
    } finally {
      this.processMonitorService.stop(process.id);
    }
  }
  async unPublishSurvey(formId) {
    const process = this.processMonitorService.start('unpublishSurvey', 'Un-publishing Survey');

    try {
      await this.groupService.unPublishSurvey(this.groupId, formId);
      await this.getForms();
      this.errorHandler.handleError(_TRANSLATE('Survey Un-published Successfully.'));
    } catch (error) {
      console.error(error);
      this.errorHandler.handleError(_TRANSLATE('Could Not Contact Server.'));
    } finally {
      this.processMonitorService.stop(process.id);
    }
  }

}
