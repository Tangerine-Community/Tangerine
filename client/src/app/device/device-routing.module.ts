import { DeviceSetupComponent } from './components/device-setup/device-setup.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {RestoreBackupComponent} from "./components/restore-backup/restore-backup.component";


const routes: Routes = [{
  path: 'device-setup',
  component: DeviceSetupComponent
  },{
    path: 'restore-backup',
    component: RestoreBackupComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DeviceRoutingModule { }
