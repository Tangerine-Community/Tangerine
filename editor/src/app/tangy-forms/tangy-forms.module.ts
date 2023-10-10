import { TangyFormsInfoService } from './tangy-forms-info-service';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TangyFormsRoutingModule } from './tangy-forms-routing.module';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from "@angular/material/menu";
import { MatTabsModule } from "@angular/material/tabs";
import {SharedModule} from "../shared/shared.module";

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [TangyFormsPlayerComponent],
  imports: [
    CommonModule,
    MatTabsModule,
    MatMenuModule,
    MatButtonModule,
    MatChipsModule,
    SharedModule,
    TangyFormsRoutingModule
  ],
  providers: [
    TangyFormsInfoService
  ],
  declarations: [TangyFormsPlayerComponent]
})
export class TangyFormsModule { }
