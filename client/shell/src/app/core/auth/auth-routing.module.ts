import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginGuard } from './_guards/login-guard.service';
import { LoginRemoteServerComponent } from './login-remote-server/login-remote-server.component';
import { LoginComponent } from './login/login.component';
import { RegisterRemoteServerComponent } from './register-remote-server/register-remote-server.component';
import { RegistrationComponent } from './registration/registration.component';

// @TODO Add edit-profile component.
// import { EditProfileComponent } from './edit-profile/edit-profile.component';
const routes: Routes = [{
  path: 'login',
  component: LoginComponent
}, {
  path: 'register',
  component: RegistrationComponent
}, {
  path: 'registerRemoteServer',
  component: RegisterRemoteServerComponent,
  canActivate: [LoginGuard]
}, {
  path: 'loginRemoteServer',
  component: LoginRemoteServerComponent,
  canActivate: [LoginGuard]
}
  // @TODO Add edit-profile component.
  /*, {
    path: 'edit-user-profile',
    component: EditProfileComponent
  }*/
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
