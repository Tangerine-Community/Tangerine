import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NgTangyFormEditorRoutingModule } from './ng-tangy-form-editor-routing.module';
import { NgTangyFormEditorComponent } from './ng-tangy-form-editor/ng-tangy-form-editor.component';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    NgTangyFormEditorRoutingModule
  ],
  declarations: [NgTangyFormEditorComponent]
})
export class NgTangyFormEditorModule { }
