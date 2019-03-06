import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UpdateRoutingModule } from './update-routing.module';
import { UpdateComponent } from './update/update.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  imports: [
    CommonModule,
    UpdateRoutingModule,
    SharedModule
  ],
  declarations: [UpdateComponent]
})
export class UpdateModule { }
