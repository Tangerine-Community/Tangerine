import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClassRoutingModule } from './class-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import {CdkTableModule} from "@angular/cdk/table";
import {SharedModule} from "../shared/shared.module";
import {DashboardService} from "./_services/dashboard.service";
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatPaginatorModule} from '@angular/material/paginator';
import { ClassFormsPlayerComponent } from './class-forms-player/class-forms-player.component';
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
import {MatSlideToggleModule} from "@angular/material/slide-toggle";

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
    MatSlideToggleModule
  ],
  declarations: [DashboardComponent, ClassFormsPlayerComponent, StudentSubtestReportComponent, StudentGroupingReportComponent, PageNotFoundComponent, StudentProgressTableComponent, TaskReportComponent, ClassConfigComponent],
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
