import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './_components/login/login.component';
import { ManageUsersComponent } from './_components/manage-users/manage-users.component';
import { UserResgistrationComponent } from './_components/user-resgistration/user-resgistration.component';
import { LoginGuard } from './_guards/login-guard.service';
import { AdminUserGuard } from './_guards/admin-user-guard.service';
import {AddUserComponent} from '../../groups/add-users/add-user.component';
import { NgxPermissionsGuard, NgxPermissionsModule } from 'ngx-permissions';
const data = {permissions:{only:['can_manage_site_wide_users'], redirectTo:'/projects'}};
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
  canActivate: [LoginGuard, NgxPermissionsGuard],
  data
},
{
  path: 'manage-users/new-user',
  component: UserResgistrationComponent,
  canActivate: [LoginGuard, NgxPermissionsGuard],
  data: {permissions:{only:['can_create_user'], redirectTo:'/projects'}}
},
{
  path: 'manage-users/users/:id',
  component: UserResgistrationComponent,
  canActivate: [LoginGuard, NgxPermissionsModule],
  data
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
