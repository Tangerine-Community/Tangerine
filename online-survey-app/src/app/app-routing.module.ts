import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormSubmittedSuccessComponent } from './form-submitted-success/form-submitted-success.component';
import { FormsListComponent } from './forms-list/forms-list.component';
import { TangyFormsPlayerComponent } from './tangy-forms-player/tangy-forms-player.component';
import { LoginGuard } from './core/auth/_guards/login-guard.service';

const routes: Routes = [
  { path: 'forms-list', component: FormsListComponent, canActivate: [LoginGuard] },
  { path: 'form-submitted-success', component: FormSubmittedSuccessComponent, canActivate: [LoginGuard] },
  { path: 'form/:formId', component: TangyFormsPlayerComponent, canActivate: [LoginGuard] },
  { path: 'form/option/:formId/:option', component: TangyFormsPlayerComponent, canActivate: [LoginGuard] },
  { path: 'caseFormResponse/:caseEventFormId', component: TangyFormsPlayerComponent, canActivate: [LoginGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
