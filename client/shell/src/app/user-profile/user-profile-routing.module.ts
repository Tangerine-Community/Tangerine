import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LoginGuard } from '../core/auth/_guards/login-guard.service';
import { ManageMySchoolsListComponent } from './manage-my-schools-list/manage-my-schools-list.component';
import { UserProfileComponent } from './user-profile.component';

const routes = [{
  path: 'manage-user-profile',
  component: UserProfileComponent,
  canActivate: [LoginGuard]
},
{
  path: 'manage-my-schools-list',
  component: ManageMySchoolsListComponent,
  canActivate: [LoginGuard]
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class UserProfileRoutingModule { }
