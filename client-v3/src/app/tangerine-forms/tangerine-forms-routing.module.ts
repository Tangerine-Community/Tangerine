import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TangerineFormsDemoComponent } from './routes/tangerine-forms-demo/tangerine-forms-demo.component';

const routes: Routes = [ {
  path: 'tangerine-forms-demo',
  component: TangerineFormsDemoComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TangerineFormsRoutingModule { }
