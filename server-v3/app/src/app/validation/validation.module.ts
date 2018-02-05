import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ControlMessages} from './validation.component';//third party component for validation

import { ValidationService } from './validation.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [ControlMessages],
  providers: [],
  exports: [
    ControlMessages
  ],
})
export class ValidationModule { }
