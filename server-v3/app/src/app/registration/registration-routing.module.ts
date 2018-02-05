import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegistrationFormComponent }    from './registration-form.component';
import { LoginFormComponent }    from './login-form.component';
import { ConfirmationComponent }  from './confirmation.component';
import { PaypalConfirmationComponent }  from './paypal-confirmation.component';
import { PasswordFormComponent }  from './password-form.component';
import { PasswordChangeFormComponent }  from './pwchange-form.component';
import { UsernameFormComponent }  from './username-form.component';
import { PlanComponent }  from './plan.component';
import { VerifyComponent }  from './verify.component';
import { CheckoutComponent }  from './checkout.component';
import { RegistrationService } from './services/registration.service';
import { AuthGuard }                from '../auth-guard.service';

const registrationRoutes: Routes = [
  { path: 'registration',  component: RegistrationFormComponent },
  { path: 'login',  component: LoginFormComponent },
  { path: 'confirmation',  component: ConfirmationComponent },
  { path: 'paypal-confirmation',  component: PaypalConfirmationComponent },
  { path: 'password',  component: PasswordFormComponent },
  { path: 'password-reset/:token',  component: PasswordChangeFormComponent },
  { path: 'plan',  component: PlanComponent, canActivate: [AuthGuard] },
  { path: 'verify',  component: VerifyComponent },
  { path: 'username',  component: UsernameFormComponent },
  { path: 'checkout',  component: CheckoutComponent }

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
