import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClassRoutingModule } from './class-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MatCardModule, MatInputModule, MatListModule, MatTableModule, MatTabsModule, MatSelectModule } from '@angular/material';
import {CdkTableModule} from "@angular/cdk/table";
import {SharedModule} from "../shared/shared.module";
import {DashboardService} from "./_services/dashboard.service";
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatPaginatorModule} from '@angular/material/paginator';
import { ClassFormsPlayerComponent } from './class-forms-player/class-forms-player.component';


@NgModule({
  imports: [
    CommonModule,
    ClassRoutingModule,
    MatTabsModule,
    MatInputModule,
    MatListModule,
    MatCardModule,
    CdkTableModule,
    MatTableModule,
    MatSelectModule,
    SharedModule,
    MatCheckboxModule,
    MatPaginatorModule
  ],
  declarations: [DashboardComponent, ClassFormsPlayerComponent],
  providers: [DashboardService]
})
export class ClassModule { }
