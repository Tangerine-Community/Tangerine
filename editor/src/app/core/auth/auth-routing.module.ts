import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './_components/login/login.component';
import { ManageUsersComponent } from './_components/manage-users/manage-users.component';
import { UserResgistrationComponent } from './_components/user-resgistration/user-resgistration.component';
import { LoginGuard } from './_guards/login-guard.service';
import { NgxPermissionsGuard } from 'ngx-permissions';
import { ManageSitewidePermissionsComponent } from './_components/manage-sitewide-permissions/manage-sitewide-permissions.component';
import { EditUserComponent } from './_components/edit-user/edit-user.component';
import { UpdatePersonalProfileComponent } from './_components/update-personal-profile/update-personal-profile.component';
const routes: Routes = [{
  path: 'register-user',
  component: UserResgistrationComponent
},
{
  path: 'login',
  component: LoginComponent
},
{
  path: 'update-personal-profile',
  component: UpdatePersonalProfileComponent,
  canActivate: [LoginGuard, NgxPermissionsGuard],
  data: { permissions: { only: ['non_user1_user'], redirectTo: '/projects' } }
},
{
  path: 'manage-users',
  component: ManageUsersComponent,
  canActivate: [LoginGuard, NgxPermissionsGuard],
  data: { permissions: { only: ['can_manage_site_wide_users'], redirectTo: '/projects' } }
},
{
  path: 'manage-users/new-user',
  component: UserResgistrationComponent,
  canActivate: [LoginGuard, NgxPermissionsGuard],
  data: { permissions: { only: ['can_create_user'], redirectTo: '/projects' } }
},
{
  path: 'manage-users/sitewide-permissions/:username',
  component: ManageSitewidePermissionsComponent,
  canActivate: [LoginGuard, NgxPermissionsGuard],
  data: { permissions: { only: ['can_manage_site_wide_users'], redirectTo: '/projects' } }
},
{
  path: 'manage-users/users/edit/:username',
  component: EditUserComponent,
  canActivate: [LoginGuard, NgxPermissionsGuard],
  data: { permissions: { only: ['can_manage_site_wide_users'], redirectTo: '/projects' } }
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
