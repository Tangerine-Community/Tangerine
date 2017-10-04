import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LoginGuard } from '../core/auth/_guards/login-guard.service';
import { CaseManagementComponent } from './case-management/case-management.component';

const routes = [{
  path: 'home',
  component: CaseManagementComponent,
  canActivate: [LoginGuard]
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class CaseManagementRoutingModule { }
