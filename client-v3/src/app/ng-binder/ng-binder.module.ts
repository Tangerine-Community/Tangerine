import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BinderComponent } from './binder/binder.component';
import { NgJsonFormModule } from '../ng-json-form/ng-json-form.module';
import { BinderExampleComponent } from './binder-example/binder-example.component';
import { NgBinderRoutingModule } from './ng-binder-routing.module';

@NgModule({
  imports: [
    NgJsonFormModule,
    CommonModule,
    NgBinderRoutingModule
  ],
  exports: [BinderComponent],
  declarations: [BinderComponent, BinderExampleComponent]
})
export class NgBinderModule { }
