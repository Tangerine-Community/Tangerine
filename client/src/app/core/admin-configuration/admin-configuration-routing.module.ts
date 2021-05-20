import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginGuard} from "../../shared/_guards/login-guard.service";
import {CreateProfileGuardService} from "../../shared/_guards/create-profile-guard.service";
import {AdminConfigurationComponent} from "./admin-configuration/admin-configuration.component";


const routes: Routes = [{
  path: 'admin-configuration',
  component: AdminConfigurationComponent,
  canActivate: [LoginGuard, CreateProfileGuardService]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  declarations: []
})
export class AdminConfigurationRoutingModule { }
