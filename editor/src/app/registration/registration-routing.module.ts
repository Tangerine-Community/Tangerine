import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfirmationComponent } from './confirmation.component';
import { PasswordFormComponent } from './password-form.component';
import { PasswordChangeFormComponent } from './pwchange-form.component';
import { RegistrationFormComponent } from './registration-form.component';
import { UsernameFormComponent } from './username-form.component';
import { VerifyComponent } from './verify.component';


const registrationRoutes: Routes = [
  { path: 'registration', component: RegistrationFormComponent },
  { path: 'confirmation', component: ConfirmationComponent },
  { path: 'password', component: PasswordFormComponent },
  { path: 'password-reset/:token', component: PasswordChangeFormComponent },
  { path: 'verify', component: VerifyComponent },
  { path: 'username', component: UsernameFormComponent }

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
