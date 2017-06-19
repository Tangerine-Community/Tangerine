import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormlyModule, FormlyBootstrapModule } from 'ng-formly';
import { TangerineFormComponent } from './tangerine-form/tangerine-form.component';
import { TangerinePageComponent } from './tangerine-page/tangerine-page.component';



@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule.forRoot(),
    FormlyBootstrapModule
  ],
  declarations: [TangerineFormComponent, TangerinePageComponent]
})
export class TangerineFormsModule { }
