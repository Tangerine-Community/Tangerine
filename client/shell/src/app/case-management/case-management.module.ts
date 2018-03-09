import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule, MatInputModule, MatListModule, MatTableModule, MatTabsModule, MatSelectModule } from '@angular/material';

import { SharedModule } from '../shared/shared.module';
import { CaseManagementService } from './_services/case-management.service';
import { CaseManagementRoutingModule } from './case-management-routing.module';
import { FormListComponent } from './form-list/form-list.component';
import { SchoolsVisitedComponent } from './schools-visited/schools-visited.component';
import { CaseDetailsComponent } from './case-details/case-details.component';
//import { AllObservationsComponent } from './all-observations/all-observations.component';

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
  declarations: [
    FormListComponent, 
    SchoolsVisitedComponent,
    CaseDetailsComponent 
  ],
    //, AllObservationsComponent],
  providers: [CaseManagementService]
})
export class CaseManagementModule { }
