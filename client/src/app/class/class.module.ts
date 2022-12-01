import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClassRoutingModule } from './class-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyPaginatorIntl as MatPaginatorIntl } from '@angular/material/legacy-paginator';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import {CdkTableModule} from "@angular/cdk/table";
import {SharedModule} from "../shared/shared.module";
import {DashboardService} from "./_services/dashboard.service";
import {MatLegacyCheckboxModule as MatCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyPaginatorModule as MatPaginatorModule} from '@angular/material/legacy-paginator';
import {MatPaginationIntlService} from "./_services/mat-pagination-intl.service";
import {TranslateService} from "@ngx-translate/core";
import { StudentSubtestReportComponent } from './reports/student-subtest-report/student-subtest-report.component';
import { StudentGroupingReportComponent } from './reports/student-grouping-report/student-grouping-report.component';
import {PageNotFoundComponent} from "./page-not-found.component";
import { StudentProgressTableComponent } from './reports/student-progress-table/student-progress-table.component';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import { TaskReportComponent } from './reports/task-report/task-report.component';
import {ClassFormService} from './_services/class-form.service';
import {UserService} from '../shared/_services/user.service';
import { ClassConfigComponent } from './class-config/class-config.component';
import {MatLegacySlideToggleModule as MatSlideToggleModule} from "@angular/material/legacy-slide-toggle";
import { ClassFormComponent } from './class-form/class-form.component';
import {TangyFormsModule} from "../tangy-forms/tangy-forms.module";
import {ClassFormsPlayerComponent} from "./class-forms-player.component";

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
    TangyFormsModule
  ],
  declarations: [DashboardComponent, StudentSubtestReportComponent, StudentGroupingReportComponent, PageNotFoundComponent, StudentProgressTableComponent, TaskReportComponent, ClassConfigComponent, ClassFormComponent, ClassFormsPlayerComponent],
  providers: [UserService, ClassFormService, DashboardService,  {
    provide: MatPaginatorIntl,
    useFactory: (translate) => {
      const service = new MatPaginationIntlService();
      service.injectTranslateService(translate);
      return service;
    },
    deps: [TranslateService]
  }]
})
export class ClassModule { }
