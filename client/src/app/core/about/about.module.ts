import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AboutRoutingModule } from './about-routing.module';
import { AboutComponent } from './about/about.component';
import { TangyFormsModule } from '../../tangy-forms/tangy-forms.module';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [AboutComponent],
  imports: [
    CommonModule,
    AboutRoutingModule,
    TangyFormsModule
  ]
})
export class AboutModule { }
