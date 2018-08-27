import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CreateProfileGuardService} from "../user-profile/create-profile-guard.service";
import {LoginGuard} from "../core/auth/_guards/login-guard.service";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {ClassFormsPlayerComponent} from "./class-forms-player/class-forms-player.component";
import {StudentSubtestReportComponent} from "./reports/student-subtest-report/student-subtest-report.component";
import {StudentGroupingReportComponent} from "./reports/student-grouping-report/student-grouping-report.component";


const routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  },
  {
    path: 'class-forms-player',
    component: ClassFormsPlayerComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  },
  {
    path: 'reports/grouping/:type/:classId',
    component: StudentGroupingReportComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  },
  {
    path: 'reports/studentSubtestReport/:classId',
    component: StudentSubtestReportComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClassRoutingModule { }
