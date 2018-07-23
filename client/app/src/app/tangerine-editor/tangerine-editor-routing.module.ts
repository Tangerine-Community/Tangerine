import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TangerineEditorDashboardComponent } from './tangerine-editor-dashboard/tangerine-editor-dashboard.component'
import { TangerineEditorFormEditorComponent } from './tangerine-editor-form-editor/tangerine-editor-form-editor.component';

const routes: Routes = [
  {
    path: 'tangerine-editor',
    component: TangerineEditorDashboardComponent 
  },
  {
    path: 'tangerine-editor/form-editor',
    component: TangerineEditorFormEditorComponent 
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TangerineEditorRoutingModule { }
