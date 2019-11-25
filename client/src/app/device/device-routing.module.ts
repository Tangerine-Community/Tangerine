import { DeviceSetupComponent } from './components/device-setup/device-setup.component';
import { DeviceRegistrationComponent } from './components/device-registration/device-registration.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [{
  path: 'device-setup',
  component: DeviceSetupComponent
}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeviceRoutingModule { }
