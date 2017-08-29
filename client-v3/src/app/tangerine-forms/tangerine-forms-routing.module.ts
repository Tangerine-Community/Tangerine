import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TangerineFormsDemoComponent } from './routes/tangerine-forms-demo/tangerine-forms-demo.component';
import { TangerineFormCardDemoComponent } from './routes/tangerine-form-card-demo/tangerine-form-card-demo.component';
import { TangerineFormResumeDemoComponent } from './routes/tangerine-form-resume-demo/tangerine-form-resume-demo.component';

const routes: Routes = [ {
  path: 'tangerine-forms-demo',
  component: TangerineFormsDemoComponent,
},
{
  path: 'tangerine-form-resume-demo',
  component: TangerineFormResumeDemoComponent
},
{
  path: 'tangerine-form-card-demo',
  component: TangerineFormCardDemoComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class TangerineFormsRoutingModule { }
