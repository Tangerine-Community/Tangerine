import { DeviceSetupComponent } from './components/device-setup/device-setup.component';
import { DeviceRegistrationComponent } from './components/device-registration/device-registration.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ImportDataComponent} from "../core/import-data/import-data/import-data.component";
import {LoginGuard} from "../shared/_guards/login-guard.service";
import {CreateProfileGuardService} from "../shared/_guards/create-profile-guard.service";


const routes: Routes = [{
  path: 'device-setup',
  component: DeviceSetupComponent
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeviceRoutingModule { }
