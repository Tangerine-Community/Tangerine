import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule, MatInputModule, MatListModule, MatTableModule, MatTabsModule, MatSelectModule } from '@angular/material';

import { SharedModule } from '../shared/shared.module';
import { TangerineEditorRoutingModule } from './tangerine-editor-routing.module';
import { TangerineEditorDashboardComponent } from './tangerine-editor-dashboard/tangerine-editor-dashboard.component';
import { TangerineEditorFormListComponent } from './tangerine-editor-form-list/tangerine-editor-form-list.component';
import { TangerineEditorFormEditorComponent } from './tangerine-editor-form-editor/tangerine-editor-form-editor.component';

@NgModule({
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
  imports: [
    CommonModule,
    MatTabsModule,
    MatInputModule,
    MatListModule,
    MatCardModule,
    MatTableModule,
    MatSelectModule,
    TangerineEditorRoutingModule,
    SharedModule
  ],
  declarations: [TangerineEditorDashboardComponent, TangerineEditorFormListComponent, TangerineEditorFormEditorComponent]
})
export class TangerineEditorModule { }
