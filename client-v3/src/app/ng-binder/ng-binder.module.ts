import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BinderComponent } from './binder/binder.component';
import { NgJsonFormModule } from '../ng-json-form/ng-json-form.module';
import { CovalentDynamicFormsModule } from '@covalent/dynamic-forms';

@NgModule({
  imports: [
    CovalentDynamicFormsModule,
    CommonModule
  ],
  exports: [BinderComponent],
  declarations: [BinderComponent]
})
export class NgBinderModule { }
