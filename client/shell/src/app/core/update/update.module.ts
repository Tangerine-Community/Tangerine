import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UpdateRoutingModule } from './update-routing.module';
import { UpdateComponent } from './update/update.component';

@NgModule({
  imports: [
    CommonModule,
    UpdateRoutingModule
  ],
  declarations: [UpdateComponent]
})
export class UpdateModule { }
