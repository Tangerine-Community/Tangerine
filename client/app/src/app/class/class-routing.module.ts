import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {CreateProfileGuardService} from "../user-profile/create-profile-guard.service";
import {LoginGuard} from "../core/auth/_guards/login-guard.service";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {ClassFormsPlayerComponent} from "./class-forms-player/class-forms-player.component";
import {StudentSubtestReportComponent} from "./reports/student-subtest-report/student-subtest-report.component";
import {StudentGroupingReportComponent} from "./reports/student-grouping-report/student-grouping-report.component";
import {PageNotFoundComponent} from "./page-not-found.component";

const appRoutes = [
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
    path: 'reports/grouping/:type/:classId/:curriculumId',
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
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule]
})
export class ClassRoutingModule { }
