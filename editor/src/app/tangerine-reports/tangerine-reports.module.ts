import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TangerineReportsComponent } from './tangerine-reports/tangerine-reports.component';

import { TangerineReportsRoutingModule } from './tangerine-reports-routing.module';

@NgModule({
  imports: [
    CommonModule,
    TangerineReportsRoutingModule
  ],
  declarations: [TangerineReportsComponent]
})
export class TangerineReportsModule { }
