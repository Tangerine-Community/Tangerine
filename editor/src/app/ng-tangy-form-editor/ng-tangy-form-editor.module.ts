import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { NgTangyFormEditorRoutingModule } from './ng-tangy-form-editor-routing.module';
import {
  NgTangyFormEditorComponent
} from './ng-tangy-form-editor/ng-tangy-form-editor.component';
import {SharedModule} from "../shared/shared.module";
import {MatTabsModule, MatIconModule, MatDialog} from "@angular/material";
import { FormJsonEditorComponent } from './form-json-editor/form-json-editor.component';
import {MatDialogModule} from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatButtonModule} from '@angular/material/button';
import {FeedbackService} from "./form-json-editor/feedback.service";
import {MatTableModule} from '@angular/material/table';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    NgTangyFormEditorRoutingModule,
    MatTabsModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatTableModule,
    SharedModule
  ],
  declarations: [NgTangyFormEditorComponent, FormJsonEditorComponent],
  entryComponents:[FormJsonEditorComponent],
  providers:[FeedbackService]
})
export class NgTangyFormEditorModule { }

