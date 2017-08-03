import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { LoginRemoteServerComponent } from './login-remote-server/login-remote-server.component';
import { RegisterRemoteServerComponent } from './register-remote-server/register-remote-server.component';
const routes: Routes = [{
  path: 'login',
  component: LoginComponent
}, {
  path: 'register',
  component: RegistrationComponent
}, {
  path: 'registerRemoteServer',
  component: RegisterRemoteServerComponent
}, {
  path: 'loginRemoteServer',
  component: LoginRemoteServerComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
