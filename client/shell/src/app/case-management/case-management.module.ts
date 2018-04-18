import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule, JsonPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule, MatInputModule, MatListModule, MatTableModule, MatTabsModule, MatSelectModule } from '@angular/material';

import { SharedModule } from '../shared/shared.module';
import { CaseManagementService } from './_services/case-management.service';
import { CaseManagementRoutingModule } from './case-management-routing.module';
import { FormListComponent } from './form-list/form-list.component';
import { SchoolsVisitedComponent } from './schools-visited/schools-visited.component';
import { CaseDetailsComponent } from './case-details/case-details.component';
import { ObservationsByLocationComponent } from './observations-by-location/observations-by-location.component';

@NgModule({
  imports: [
    CommonModule,
    CaseManagementRoutingModule,
    MatTabsModule,
    MatInputModule,
    FormsModule,
    MatListModule,
    MatCardModule,
    CdkTableModule,
    MatTableModule,
    MatSelectModule,
    SharedModule
  ],
  declarations: [FormListComponent, SchoolsVisitedComponent,
    CaseDetailsComponent, ObservationsByLocationComponent],
  providers: [CaseManagementService]
})
export class CaseManagementModule { }
