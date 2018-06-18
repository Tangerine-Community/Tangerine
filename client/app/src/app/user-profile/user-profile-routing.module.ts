import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LoginGuard } from '../core/auth/_guards/login-guard.service';
import { UserProfileComponent } from './user-profile.component';

const routes = [{
  path: 'manage-user-profile',
  component: UserProfileComponent,
  canActivate: [LoginGuard]
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class UserProfileRoutingModule { }
