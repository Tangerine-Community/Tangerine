import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MdTabsModule } from '@angular/material';

import { CaseManagementService } from './_services/case-management.service';
import { CaseManagementRoutingModule } from './case-management-routing.module';
import { CaseManagementComponent } from './case-management.component';

@NgModule({
  imports: [
    CommonModule,
    CaseManagementRoutingModule,
    MdTabsModule

  ],
  declarations: [CaseManagementComponent],
  providers: [CaseManagementService]
})
export class CaseManagementModule { }
