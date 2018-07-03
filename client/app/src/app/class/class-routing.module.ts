import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CreateProfileGuardService} from "../user-profile/create-profile-guard.service";
import {LoginGuard} from "../core/auth/_guards/login-guard.service";
import {DashboardComponent} from "./dashboard/dashboard.component";

const routes = [{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [LoginGuard, CreateProfileGuardService]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClassRoutingModule { }
