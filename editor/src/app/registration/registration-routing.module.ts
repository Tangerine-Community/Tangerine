import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegistrationFormComponent }    from './registration-form.component';
import { LoginFormComponent }    from './login-form.component';
import { ConfirmationComponent }  from './confirmation.component';
import { PasswordFormComponent }  from './password-form.component';
import { PasswordChangeFormComponent }  from './pwchange-form.component';
import { UsernameFormComponent }  from './username-form.component';
import { VerifyComponent }  from './verify.component';
import { RegistrationService } from './services/registration.service';
import { AuthGuard }                from '../auth-guard.service';

const registrationRoutes: Routes = [
  { path: 'registration',  component: RegistrationFormComponent },
  { path: 'login',  component: LoginFormComponent },
  { path: 'confirmation',  component: ConfirmationComponent },
  { path: 'password',  component: PasswordFormComponent },
  { path: 'password-reset/:token',  component: PasswordChangeFormComponent },
  { path: 'verify',  component: VerifyComponent },
  { path: 'username',  component: UsernameFormComponent }

];
@NgModule({
  imports: [
    RouterModule.forChild(registrationRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class RegistrationRoutingModule { }
