import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CaseManagementComponent } from './case-management/case-management.component';
import { LoginGuard } from './core/auth/_guards/login-guard.service';

const routes: Routes = [
  { path: '**', redirectTo: 'home' }, // redirects to '' in case no route is matched
  { path: 'home', component: CaseManagementComponent, canActivate: [LoginGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
