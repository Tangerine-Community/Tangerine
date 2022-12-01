import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule, JsonPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';

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
