import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateProfileGuardService } from '../user-profile/create-profile-guard.service';
import { LoginGuard } from '../core/auth/_guards/login-guard.service';
import { _TRANSLATE } from '../shared/translation-marker';
import { CasesComponent } from './cases/cases.component.ts';
import { NewCaseComponent } from './new-case/new-case.component.ts';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'

const routes: Routes = [
  {
    path: 'cases',
    component: CasesComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  },
  {
    path: 'new-case',
    component: NewCaseComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class CaseRoutingModule { }
