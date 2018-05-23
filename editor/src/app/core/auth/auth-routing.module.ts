import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserResgistrationComponent } from './user-resgistration/user-resgistration.component';
import { LoginComponent } from './login/login.component';
const routes: Routes = [{
  path: 'register-user',
  component: UserResgistrationComponent
},
{
  path: 'login',
  component: LoginComponent
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
