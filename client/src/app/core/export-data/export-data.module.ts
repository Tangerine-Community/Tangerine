import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportDataComponent } from './export-data/export-data.component';
import { ExportDataRoutingModule } from './export-data-routing.module';
import {MatButtonModule, MatInputModule, MatCardModule, MatTabsModule} from '@angular/material';
import { SharedModule } from '../../shared/shared.module';
@NgModule({
  imports: [
    CommonModule,
    ExportDataRoutingModule,
    MatButtonModule,
    SharedModule,
    MatTabsModule,
    MatCardModule
  ],
  declarations: [ExportDataComponent]
})
export class ExportDataModule { }
