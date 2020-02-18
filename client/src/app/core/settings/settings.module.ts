import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings/settings.component';
import { SharedModule } from '../../shared/shared.module';
import {MatFormFieldModule, MatSelectModule, MatTabsModule, MatButtonModule} from '@angular/material';

@NgModule({
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    SharedModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule
  ]
})
export class SettingsModule { }
