import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CaseManagementComponent } from './case-management/case-management.component';
import { CaseManagementRoutingModule } from './case-management-routing.module';

@NgModule({
  imports: [
    CommonModule,
    CaseManagementRoutingModule
  ],
  declarations: [CaseManagementComponent]
})
export class CaseManagementModule { }
