import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaintenanceRoutingModule } from './maintenance-routing.module';
import { MaintenanceComponent } from './maintenance/maintenance.component';
import { SharedModule } from 'src/app/shared/shared.module';
import {MatLegacyCardModule as MatCardModule} from "@angular/material/legacy-card";
import {MatLegacyButtonModule as MatButtonModule} from '@angular/material/legacy-button';
import {MatDividerModule} from "@angular/material/divider";


@NgModule({
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  declarations: [MaintenanceComponent],
  imports: [
    CommonModule,
    MaintenanceRoutingModule,
    SharedModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule
  ]
})
export class MaintenanceModule { }
