import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LoginGuard } from '../core/auth/_guards/login-guard.service';
import { CaseManagementComponent } from './case-management.component';
import { FormListComponent } from './form-list/form-list.component';

const routes = [{
  path: 'case-management',
  component: CaseManagementComponent,
  canActivate: [LoginGuard]
}, {
  path: 'forms-list',
  component: FormListComponent,
  canActivate: [LoginGuard]
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class CaseManagementRoutingModule { }
