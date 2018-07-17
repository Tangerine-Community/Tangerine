import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './_components/login/login.component';
import { ManageUsersComponent } from './_components/manage-users/manage-users.component';
import { UserResgistrationComponent } from './_components/user-resgistration/user-resgistration.component';
import { LoginGuard } from './_guards/login-guard.service';
import { SuperAdminUserGuard } from './_guards/super-admin-user-guard.service';
const routes: Routes = [{
  path: 'register-user',
  component: UserResgistrationComponent
},
{
  path: 'login',
  component: LoginComponent
}, {
  path: 'manage-users',
  component: ManageUsersComponent,
  canActivate: [LoginGuard, SuperAdminUserGuard]
},
{
  path: 'manage-users/new-user',
  component: UserResgistrationComponent,
  canActivate: [LoginGuard, SuperAdminUserGuard]
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
