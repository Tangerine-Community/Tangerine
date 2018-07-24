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
  MatMenuModule
} from '@angular/material';
import {CdkTableModule} from "@angular/cdk/table";
import {SharedModule} from "../shared/shared.module";
import {DashboardService} from "./_services/dashboard.service";
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatPaginatorModule} from '@angular/material/paginator';
import { ClassFormsPlayerComponent } from './class-forms-player/class-forms-player.component';
import { ReportsComponent } from './reports/reports.component';
// import {ClassUtils} from "./class-utils.js";

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
    MatPaginatorModule
  ],
  declarations: [DashboardComponent, ClassFormsPlayerComponent, ReportsComponent],
  providers: [DashboardService]
})
export class ClassModule { }
