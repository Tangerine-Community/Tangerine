import { NewIssueComponent } from './components/new-issue/new-issue.component';
import { IssueFormComponent } from './components/issue-form/issue-form.component';
import { IssueComponent } from './components/issue/issue.component';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseComponent } from './components/case/case.component';
import { EventComponent } from './components/event/event.component';
//import { FormComponent } from './components/form/form.component';
import { NewCaseComponent } from './components/new-case/new-case.component';
import { CaseRoutingModule } from './case-routing.module';
import { EventFormComponent } from './components/event-form/event-form.component';
import { CaseBreadcrumbComponent } from './components/case-breadcrumb/case-breadcrumb.component';
import { SharedModule } from '../shared/shared.module'
import { CaseDefinitionsService } from './services/case-definitions.service';
import { CaseService } from './services/case.service';
import { TangyFormsModule } from '../tangy-forms/tangy-forms.module';
import { CasesService } from './services/cases.service';
import { FormsModule } from '@angular/forms';
import { CaseEventListItemComponent } from './components/case-event-list-item/case-event-list-item.component';
import { EventFormListItemComponent } from './components/event-form-list-item/event-form-list-item.component';
import { QueryComponent } from './components/query/query.component';
import { EventFormAddComponent } from './components/event-form-add/event-form-add.component';
import { CaseNotificationsComponent } from './components/case-notifications/case-notifications.component';
import { EventFormsForParticipantComponent } from './components/event-forms-for-participant/event-forms-for-participant.component';
import { EventFormsForParticipantPageComponent } from './components/event-forms-for-participant-page/event-forms-for-participant-page.component';
import { CustomAppComponent } from './components/custom-app/custom-app.component';
import { IssuesComponent } from './components/issues/issues.component';

@NgModule({
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  exports: [
    IssuesComponent,
    QueryComponent
  ],
  imports: [
    FormsModule,
    CaseRoutingModule,
    SharedModule,
    TangyFormsModule,
    CommonModule
  ],
  providers: [
    CaseDefinitionsService,
    CaseService,
    CasesService
  ],
  declarations: [
    EventComponent,
    IssueComponent,
    IssueFormComponent,
    CaseComponent,
    NewCaseComponent,
    EventFormComponent,
    CaseBreadcrumbComponent,
    CaseEventListItemComponent,
    EventFormListItemComponent,
    QueryComponent,
    EventFormAddComponent,
    CaseNotificationsComponent,
    EventFormsForParticipantComponent,
    EventFormsForParticipantPageComponent,
    CustomAppComponent,
    IssuesComponent,
    NewIssueComponent
  ]
})
export class CaseModule { }
