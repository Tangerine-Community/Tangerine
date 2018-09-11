import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClassRoutingModule } from './class-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import {
  MatCardModule,
  MatInputModule,
  MatListModule,
  MatTableModule,
  MatTabsModule,
  MatSelectModule,
  MatMenuModule,
  MatPaginatorIntl,
  MatButtonModule
} from '@angular/material';
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

@NgModule({
  imports: [
    CommonModule,
    ClassRoutingModule,
    MatTabsModule,
    MatInputModule,
    MatMenuModule,
    MatListModule,
    MatCardModule,
    CdkTableModule,
    MatTableModule,
    MatSelectModule,
    SharedModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatButtonModule
  ],
  declarations: [DashboardComponent, ClassFormsPlayerComponent, StudentSubtestReportComponent, StudentGroupingReportComponent],
  providers: [DashboardService, {
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
