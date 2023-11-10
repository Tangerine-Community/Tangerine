import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {CreateProfileGuardService} from "../shared/_guards/create-profile-guard.service";
import {LoginGuard} from "../shared/_guards/login-guard.service";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {StudentSubtestReportComponent} from "./reports/student-subtest-report/student-subtest-report.component";
import {StudentGroupingReportComponent} from "./reports/student-grouping-report/student-grouping-report.component";
import {StudentProgressTableComponent} from "./reports/student-progress-table/student-progress-table.component";
import {TaskReportComponent} from "./reports/task-report/task-report.component";
import {ClassConfigComponent} from "./class-config/class-config.component";
import {ClassFormComponent} from "./class-form/class-form.component";
import {ClassFormsPlayerComponent} from "./class-forms-player.component";
import {AttendanceComponent} from "./reports/attendance/attendance.component";
import {GradesComponent} from "./reports/grades/grades.component";
import {AttendanceDashboardComponent} from "./attendance/attendance-dashboard/attendance-dashboard.component";
import {AttendanceCheckComponent} from "./attendance/attendance-check/attendance-check.component";
import {AttendanceScoresComponent} from "./attendance/attendance-scores/attendance-scores.component";

const appRoutes = [
  {
    path: 'attendance-dashboard',
    component: AttendanceDashboardComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  },  
  {
    path: 'attendance-check',
    component: AttendanceCheckComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  }, 
  {
    path: 'attendance-scores',
    component: AttendanceScoresComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
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
    path: 'reports/attendance/:classId',
    component: AttendanceComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  },
  {
    path: 'reports/grades/:classId',
    component: GradesComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  },
  {
    path: 'class-config',
    component: ClassConfigComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  },
  {
    path: 'class-form',
    component: ClassFormComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  },
  {
    path: 'class-forms-player',
    component: ClassFormsPlayerComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule]
})
export class ClassRoutingModule { }
