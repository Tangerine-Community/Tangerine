import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TangerineFormsDemoComponent } from './routes/tangerine-forms-demo/tangerine-forms-demo.component';
import { TangerineFormCardDemoComponent } from './routes/tangerine-form-card-demo/tangerine-form-card-demo.component';

const routes: Routes = [ {
  path: 'tangerine-forms-demo',
  component: TangerineFormsDemoComponent
},
{
  path: 'tangerine-form-card-demo',
  component: TangerineFormCardDemoComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TangerineFormsRoutingModule { }
