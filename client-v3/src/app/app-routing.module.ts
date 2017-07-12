import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './core/auth/login/login.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    children: []
  },
  { path: '**', redirectTo: '' }// redirects to '' in case no route is matched
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
