import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgTangyFormEditorComponent } from './ng-tangy-form-editor/ng-tangy-form-editor.component';

const routes: Routes = [

    { path: 'tangy-form-editor/:groupName/:formId', component: NgTangyFormEditorComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NgTangyFormEditorRoutingModule { }
