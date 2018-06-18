import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { LoginGuard } from '../core/auth/_guards/login-guard.service';
import { CreateProfileGuardService } from '../user-profile/create-profile-guard.service';
import { FormListComponent } from './form-list/form-list.component';
import { CaseDetailsComponent } from './case-details/case-details.component';

const routes = [{
  path: 'case-details',
  component: CaseDetailsComponent,
  canActivate: [LoginGuard, CreateProfileGuardService]
}, {
  path: 'forms-list',
  component: FormListComponent,
  canActivate: [LoginGuard, CreateProfileGuardService]
}];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class CaseManagementRoutingModule { }
