import { SharedModule } from 'src/app/shared/shared.module';
import { DeviceSyncComponent } from './components/device-sync/device-sync.component';
import { DeviceLanguageComponent } from './components/device-language/device-language.component';
import { DeviceRegistrationComponent } from './components/device-registration/device-registration.component';
import { DeviceSetupComponent } from './components/device-setup/device-setup.component';
import { DeviceRoutingModule } from './device-routing.module';
import { DeviceService } from './services/device.service';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DevicePasswordComponent } from './components/device-password/device-password.component';
import {MatLegacyButtonModule as MatButtonModule} from "@angular/material/legacy-button";
import {MatIconModule} from "@angular/material/icon";
import { RouterModule } from '@angular/router';
import {MatLegacyTabsModule as MatTabsModule} from "@angular/material/legacy-tabs";
import {MatLegacyCardModule as MatCardModule} from "@angular/material/legacy-card";
import { RestoreBackupComponent } from './components/restore-backup/restore-backup.component';
import { DeviceResyncComponent } from './components/device-resync/device-resync.component';
import { DevicePermissionsComponent } from './components/device-permissions/device-permissions.component';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    DeviceSetupComponent,
    DeviceRegistrationComponent,
    DeviceLanguageComponent,
    DeviceSyncComponent,
    DevicePasswordComponent,
    DevicePermissionsComponent,
    RestoreBackupComponent,
    DeviceResyncComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DeviceRoutingModule,
    MatButtonModule, MatIconModule,
    RouterModule, MatTabsModule, MatCardModule
  ],
  providers: [
    DeviceService
  ]
})
export class DeviceModule { }
