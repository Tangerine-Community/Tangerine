import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NewFormResponseRoutingModule } from './new-form-response-routing.module';
import { NewFormResponseComponent } from './new-form-response.component';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [NewFormResponseComponent],
  imports: [
    CommonModule,
    SharedModule,
    NewFormResponseRoutingModule
  ]
})
export class NewFormResponseModule { }
