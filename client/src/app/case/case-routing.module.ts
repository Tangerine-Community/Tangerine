import { EventFormAddComponent } from './components/event-form-add/event-form-add.component';
import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginGuard } from '../shared/_guards/login-guard.service';
import { _TRANSLATE } from '../shared/translation-marker';
import { NewCaseComponent } from './components/new-case/new-case.component';
import { CaseComponent } from './components/case/case.component';
import { EventComponent } from './components/event/event.component'
import { EventFormComponent } from './components/event-form/event-form.component'

const routes: Routes = [
  {
    path: 'case/:id',
    component: CaseComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'case/event/:caseId/:eventId',
    component: EventComponent,
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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class CaseRoutingModule { }
