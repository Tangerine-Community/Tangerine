import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportDataComponent } from './export-data/export-data.component';
import { ExportDataRoutingModule } from './export-data-routing.module';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { SharedModule } from '../../shared/shared.module';
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
@NgModule({
  imports: [
    CommonModule,
    ExportDataRoutingModule,
    MatButtonModule,
    SharedModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  declarations: [ExportDataComponent]
})
export class ExportDataModule { }
