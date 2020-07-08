import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportDataComponent } from "./import-data/import-data.component";
import { ImportDataRoutingModule } from './import-data-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [ImportDataComponent],
  imports: [
    CommonModule,
    ImportDataRoutingModule,
    MatButtonModule,
    SharedModule,
    MatTabsModule,
    MatCardModule
  ]
})
export class ImportDataModule { }
