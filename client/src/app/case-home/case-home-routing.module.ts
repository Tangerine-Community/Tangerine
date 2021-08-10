import { NgModule, Injectable } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateProfileGuardService } from '../shared/_guards/create-profile-guard.service';
import { LoginGuard } from '../shared/_guards/login-guard.service';
import { _TRANSLATE } from '../shared/translation-marker';
import { CaseHomeComponent } from './components/case-home/case-home.component';
import {ProcessGuard} from "../shared/_guards/process-guard.service";

const routes: Routes = [
  {
    path: 'case-home',
    component: CaseHomeComponent,
    canActivate: [LoginGuard, CreateProfileGuardService],
    canDeactivate: [ProcessGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class CaseHomeRoutingModule { }
