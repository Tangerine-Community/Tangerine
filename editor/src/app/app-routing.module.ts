import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';
import {SupportComponent} from './support/support.component';
import { AuthGuard }                from './auth-guard.service';

const appRoutes: Routes = [
  { path: 'support', component: SupportComponent, canActivate: [AuthGuard] },
];
@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { useHash: true })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}

