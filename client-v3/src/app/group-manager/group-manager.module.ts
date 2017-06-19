import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GroupManagerComponent } from './group-manager.component';
import {TangerinePageComponent} from "../tangerine-forms/tangerine-page/tangerine-page.component";
import {FormlyBootstrapModule, FormlyModule} from "ng-formly";
import {ReactiveFormsModule} from "@angular/forms";

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormlyModule.forRoot(),
    FormlyBootstrapModule
  ],
  declarations: [GroupManagerComponent, TangerinePageComponent]
})
export class GroupManagerModule { }
