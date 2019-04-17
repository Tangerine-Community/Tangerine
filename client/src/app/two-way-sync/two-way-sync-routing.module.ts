import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CreateProfileGuardService} from "../shared/_guards/create-profile-guard.service";
import {LoginGuard} from "../shared/_guards/login-guard.service";
import { TwoWaySyncComponent } from './components/two-way-sync/two-way-sync.component';

const appRoutes:Routes = [
  {
    path: 'two-way-sync',
    component: TwoWaySyncComponent,
    canActivate: [LoginGuard, CreateProfileGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule]
})
export class TwoWaySyncRoutingModule { }
