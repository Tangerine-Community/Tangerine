import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormSubmittedSuccessComponent } from './form-submitted-success/form-submitted-success.component';
import { FormsListComponent } from './forms-list/forms-list.component';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';

const routes: Routes = [
  //{ path: '', component: FormsListComponent },
  { path: 'form-submitted-success', component: FormSubmittedSuccessComponent },
  { path: 'form/:id', component: TangyFormsPlayerComponent },
  { path: 'form/option/:formId/:option', component: TangyFormsPlayerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
