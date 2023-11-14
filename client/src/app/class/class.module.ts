import {NgModule} from '@angular/core';
import {CommonModule, registerLocaleData} from '@angular/common';

import {ClassRoutingModule} from './class-routing.module';
import {DashboardComponent} from './dashboard/dashboard.component';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatPaginatorIntl} from '@angular/material/paginator';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {CdkTableModule} from "@angular/cdk/table";
import {SharedModule} from "../shared/shared.module";
import {DashboardService} from "./_services/dashboard.service";
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatPaginatorModule} from '@angular/material/paginator';
import {MatPaginationIntlService} from "./_services/mat-pagination-intl.service";
import {TranslateService} from "@ngx-translate/core";
import {StudentSubtestReportComponent} from './reports/student-subtest-report/student-subtest-report.component';
import {
  FeedbackDialog,
  StudentGroupingReportComponent
} from './reports/student-grouping-report/student-grouping-report.component';
import {PageNotFoundComponent} from "./page-not-found.component";
import {StudentProgressTableComponent} from './reports/student-progress-table/student-progress-table.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {TaskReportComponent} from './reports/task-report/task-report.component';
import {ClassFormService} from './_services/class-form.service';
import {UserService} from '../shared/_services/user.service';
import {ClassConfigComponent} from './class-config/class-config.component';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {ClassFormComponent} from './class-form/class-form.component';
import {TangyFormsModule} from "../tangy-forms/tangy-forms.module";
import {ClassFormsPlayerComponent} from "./class-forms-player.component";
import {MatDialogModule} from "@angular/material/dialog";
import {MatChipsModule} from "@angular/material/chips";
import {AttendanceComponent} from './reports/attendance/attendance.component';
import {FormsModule} from "@angular/forms";
import {GradesComponent} from './reports/grades/grades.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {ProgressBarColor} from "./utils/progress-bar-color";
import {AttendanceDashboardComponent} from './attendance/attendance-dashboard/attendance-dashboard.component';
import {AttendanceCheckComponent} from './attendance/attendance-check/attendance-check.component';
import {AttendanceNavComponent} from "./attendance/attendance-nav.component";
import { AttendanceScoresComponent } from './attendance/attendance-scores/attendance-scores.component';
import { BehaviorCheckComponent } from './attendance/behavior-check/behavior-check.component';
import { StudentDetailsComponent } from './attendance/student-details/student-details.component';
import {MatBottomSheetModule} from '@angular/material/bottom-sheet';
// import {MatDatepickerModule} from "@angular/material/datepicker";
import {FullCalendarModule} from "@fullcalendar/angular";
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!
import interactionPlugin from '@fullcalendar/interaction'; // a plugin!
// import { registerLocaleData } from '@angular/common';
// import localeEsGt from '@angular/common/locales/es-GT';

// the second parameter 'fr-FR' is optional
// registerLocaleData(localeEsGt);

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin
]);
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ClassRoutingModule,
    MatTabsModule,
    MatInputModule,
    MatMenuModule,
    MatListModule,
    MatCardModule,
    CdkTableModule,
    MatTableModule,
    MatSelectModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    TangyFormsModule,
    MatDialogModule,
    MatChipsModule,
    MatProgressBarModule,
    FormsModule,
    MatBottomSheetModule,
    FullCalendarModule
  ],
  declarations: [DashboardComponent, StudentSubtestReportComponent, StudentGroupingReportComponent, FeedbackDialog, PageNotFoundComponent, StudentProgressTableComponent, TaskReportComponent, ClassConfigComponent, ClassFormComponent, ClassFormsPlayerComponent, AttendanceComponent, GradesComponent, ProgressBarColor, AttendanceDashboardComponent, AttendanceCheckComponent, AttendanceNavComponent, AttendanceScoresComponent, BehaviorCheckComponent, StudentDetailsComponent],
  entryComponents: [
    StudentDetailsComponent
  ],
  providers: [UserService, ClassFormService, DashboardService, {
    provide: MatPaginatorIntl,
    useFactory: (translate) => {
      const service = new MatPaginationIntlService();
      service.injectTranslateService(translate);
      return service;
    },
    deps: [TranslateService]
  }, { provide: Window, useValue: window }]
})
export class ClassModule {
}
