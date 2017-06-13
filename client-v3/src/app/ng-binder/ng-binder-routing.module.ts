import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BinderExampleComponent } from './binder-example/binder-example.component';

const routes: Routes = [ {
  path: 'binder-example',
  component: BinderExampleComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NgBinderRoutingModule { }
