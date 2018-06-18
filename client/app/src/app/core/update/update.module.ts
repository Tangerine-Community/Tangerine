import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UpdateRoutingModule } from './update-routing.module';
import { UpdateComponent } from './update/update.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    UpdateRoutingModule,
    SharedModule
  ],
  declarations: [UpdateComponent]
})
export class UpdateModule { }
