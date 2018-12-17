import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginGuard } from './core/auth/_guards/login-guard.service';
import { SupportComponent } from './support/support.component';

const appRoutes: Routes = [
  { path: 'support', component: SupportComponent, canActivate: [LoginGuard] }
];
@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes, { useHash: true })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }

