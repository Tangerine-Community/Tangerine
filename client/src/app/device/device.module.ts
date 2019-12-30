import { DeviceSyncComponent } from './components/device-sync/device-sync.component';
import { DeviceLanguageComponent } from './components/device-language/device-language.component';
import { DeviceRegistrationComponent } from './components/device-registration/device-registration.component';
import { DeviceSetupComponent } from './components/device-setup/device-setup.component';
import { DeviceRoutingModule } from './device-routing.module';
import { DeviceService } from './services/device.service';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    DeviceSetupComponent,
    DeviceRegistrationComponent,
    DeviceLanguageComponent,
    DeviceSyncComponent


  ],
  imports: [
    CommonModule,
    DeviceRoutingModule 
  ],
  providers: [
    DeviceService
  ]
})
export class DeviceModule { }
