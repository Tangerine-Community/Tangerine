import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';
import {SupportComponent} from './support/support.component';
import { AuthGuard }                from './auth-guard.service';
//import { RegComponent }   from './reg/reg.component';
const appRoutes: Routes = [
  { path: 'support', component: SupportComponent, canActivate: [AuthGuard] },
  //{ path: '**', component: PageNotFoundComponent }
];
@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {}

