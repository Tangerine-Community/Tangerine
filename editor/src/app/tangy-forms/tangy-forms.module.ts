import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';
import { TangyFormsRoutingModule } from './tangy-forms-routing.module';

@NgModule({
  imports: [
    CommonModule,
    TangyFormsRoutingModule
  ],
  declarations: [TangyFormsPlayerComponent]
})
export class TangyFormsModule { }
