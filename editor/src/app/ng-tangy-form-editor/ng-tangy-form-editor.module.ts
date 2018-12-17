import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { NgTangyFormEditorRoutingModule } from './ng-tangy-form-editor-routing.module';
import { NgTangyFormEditorComponent } from './ng-tangy-form-editor/ng-tangy-form-editor.component';
import {SharedModule} from "../shared/shared.module";
import {MatTabsModule} from "@angular/material";

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    NgTangyFormEditorRoutingModule,
    MatTabsModule,
    SharedModule
  ],
  declarations: [NgTangyFormEditorComponent]
})
export class NgTangyFormEditorModule { }
