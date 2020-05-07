import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { NgTangyFormEditorRoutingModule } from './ng-tangy-form-editor-routing.module';
import { NgTangyFormEditorComponent } from './ng-tangy-form-editor/ng-tangy-form-editor.component';
import { SharedModule } from "../shared/shared.module";
import { MatIconModule } from "@angular/material/icon";
import { MatTabsModule } from "@angular/material/tabs";
import { FeedbackEditorComponent } from './feedback-editor/feedback-editor.component';
import { FormsModule } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {FeedbackService} from "./feedback-editor/feedback.service";
import {MatTableModule} from '@angular/material/table';
import {FormMetadata} from "./feedback-editor/form-metadata";
import {MatCardModule} from '@angular/material/card';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    NgTangyFormEditorRoutingModule,
    MatTabsModule,
    MatIconModule,
    FormsModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTableModule,
    MatCardModule,
    SharedModule
  ],
  exports: [
    NgTangyFormEditorComponent
  ],
  declarations: [NgTangyFormEditorComponent, FeedbackEditorComponent],
  providers:[FeedbackService, FormMetadata]
})
export class NgTangyFormEditorModule { }

