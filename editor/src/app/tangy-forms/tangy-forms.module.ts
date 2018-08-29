import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TangyFormsRoutingModule } from './tangy-forms-routing.module';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';
import {MatTabsModule} from "@angular/material";
import {SharedModule} from "../shared/shared.module";

@NgModule({
  imports: [
    CommonModule,
    MatTabsModule,
    SharedModule,
    TangyFormsRoutingModule
  ],
  declarations: [TangyFormsPlayerComponent]
})
export class TangyFormsModule { }
