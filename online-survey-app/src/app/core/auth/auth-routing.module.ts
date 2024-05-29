import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SurveyLoginComponent } from './_components/survey-login/survey-login.component';
import { UserRegistrationComponent } from './_components/user-registration/user-registration.component';

const routes: Routes = [
  {
    path: 'register-user',
    component: UserRegistrationComponent
  },
  {
    path: 'survey-login',
    component: SurveyLoginComponent
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
