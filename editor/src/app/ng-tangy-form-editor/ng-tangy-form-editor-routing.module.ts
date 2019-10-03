import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NgTangyFormEditorComponent } from './ng-tangy-form-editor/ng-tangy-form-editor.component';
import { AdminUserGuard } from '../core/auth/_guards/admin-user-guard.service';

const routes: Routes = [

  { path: 'tangy-form-editor/:groupName/:formId', component: NgTangyFormEditorComponent, canActivate: [AdminUserGuard] },
  { path: 'tangy-form-editor/:groupName/:formId/:print', component: NgTangyFormEditorComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NgTangyFormEditorRoutingModule { }
