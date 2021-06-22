import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {CreateProfileGuardService} from "../shared/_guards/create-profile-guard.service";
import {LoginGuard} from "../shared/_guards/login-guard.service";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {ClassFormsPlayerComponent} from "./class-forms-player/class-forms-player.component";
import {StudentSubtestReportComponent} from "./reports/student-subtest-report/student-subtest-report.component";
import {StudentGroupingReportComponent} from "./reports/student-grouping-report/student-grouping-report.component";
import {StudentProgressTableComponent} from "./reports/student-progress-table/student-progress-table.component";
import {TaskReportComponent} from "./reports/task-report/task-report.component";
import {ClassConfigComponent} from "./class-config/class-config.component";

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
  },
  {
    path: 'reports/studentProgressTable/:type/:classId/:curriculumId',
    component: StudentProgressTableComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  },
  {
    path: 'reports/taskReport/:classId',
    component: TaskReportComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  },
  {
    path: 'class-config',
    component: ClassConfigComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule]
})
export class ClassRoutingModule { }
