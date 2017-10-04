import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TangyFormsRoutingModule } from './tangy-forms-routing.module';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';

@NgModule({
  imports: [
    CommonModule,
    TangyFormsRoutingModule
  ],
  declarations: [TangyFormsPlayerComponent]
})
export class TangyFormsModule { }
