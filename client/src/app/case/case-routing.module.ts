import { NewIssueComponent } from './components/new-issue/new-issue.component';
import { IssueFormComponent } from './components/issue-form/issue-form.component';
import { IssueComponent } from './components/issue/issue.component';
import { CreateProfileGuardService } from './../shared/_guards/create-profile-guard.service';
import { CustomAppComponent } from './components/custom-app/custom-app.component';
import { EventFormsForParticipantPageComponent } from './components/event-forms-for-participant-page/event-forms-for-participant-page.component';
import { Observable } from 'rxjs';
import { EventFormAddComponent } from './components/event-form-add/event-form-add.component';
import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Routes, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { LoginGuard } from '../shared/_guards/login-guard.service';
import { _TRANSLATE } from '../shared/translation-marker';
import { NewCaseComponent } from './components/new-case/new-case.component';
import { CaseComponent } from './components/case/case.component';
import { EventComponent } from './components/event/event.component'
import { EventFormComponent } from './components/event-form/event-form.component'

@Injectable()
export class CanDeactivateEvent implements CanDeactivate<EventComponent> {
  constructor() {}
  canDeactivate(
    component: EventComponent,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): Observable<boolean>|Promise<boolean>|boolean {
    if (component.hasNotificationEnforcingAttention && !component.exitRoutes().includes(nextState.url)) {
      return confirm(_TRANSLATE('There is an urgent notification that needs attention. Are you sure you want to exit this event?'));
    } else {
      return true;
    }
  }
}

const routes: Routes = [
  {
    path: 'custom-app',
    component: CustomAppComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  },
  {
    path: 'case/:id',
    component: CaseComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'case/event/:caseId/:eventId',
    component: EventComponent,
    canActivate: [LoginGuard],
    canDeactivate: [ CanDeactivateEvent ]
  },
  {
    path: 'case/event/participant/:caseId/:eventId/:participantId',
    component: EventFormsForParticipantPageComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'case/event/form-add/:caseId/:eventId/:participantId',
    component: EventFormAddComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'case/event/form/:caseId/:eventId/:eventFormId',
    component: EventFormComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'new-case',
    component: NewCaseComponent,
    canActivate: [LoginGuard]
  },
  //{ path: 'groups/:groupId/data/issues/:issueId/form-revision', component: IssueFormComponent, canActivate: [LoginGuard] },
  //{ path: 'groups/:groupId/data/issues/:issueId/form-revision/:eventId', component: IssueFormComponent, canActivate: [LoginGuard] },
  { path: 'issue/:issueId/form-revision', component: IssueFormComponent, canActivate: [LoginGuard] },
  { path: 'issue/:issueId/form-revision/:eventId', component: IssueFormComponent, canActivate: [LoginGuard] },
  { path: 'issue/:issueId', component: IssueComponent, canActivate: [LoginGuard] },
  {
    path: 'new-issue/:caseId/:eventId/:eventFormId',
    component: NewIssueComponent,
    canActivate: [LoginGuard]
  }
 
 
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [ CanDeactivateEvent ]
})
export class CaseRoutingModule { }
