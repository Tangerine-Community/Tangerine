import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginGuard } from './_guards/login-guard.service';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';

// @TODO Add edit-profile component.
// import { EditProfileComponent } from './edit-profile/edit-profile.component';
const routes: Routes = [{
  path: 'login',
  component: LoginComponent
}, {
  path: 'register',
  component: RegistrationComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
