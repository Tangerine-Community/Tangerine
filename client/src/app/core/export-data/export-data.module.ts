import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportDataComponent } from './export-data/export-data.component';
import { ExportDataRoutingModule } from './export-data-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
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
