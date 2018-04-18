import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportDataComponent } from './export-data/export-data.component';
import { ExportDataRoutingModule } from './export-data-routing.module';
import { MatButtonModule, MatInputModule, MatCardModule } from '@angular/material';
@NgModule({
  imports: [
    CommonModule,
    ExportDataRoutingModule,
    MatButtonModule
  ],
  declarations: [ExportDataComponent]
})
export class ExportDataModule { }
