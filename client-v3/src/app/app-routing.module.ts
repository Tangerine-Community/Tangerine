import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChooseUserProfileComponent } from './core/auth/choose-user-profile/choose-user-profile.component';

const routes: Routes = [
  { path: 'test', component: ChooseUserProfileComponent },
  { path: '**', redirectTo: 'home' }// redirects to '' in case no route is matched
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
