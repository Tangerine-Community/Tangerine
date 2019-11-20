import { DeviceService } from './services/device.service';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule
  ],
  providers: [
    DeviceService
  ]
})
export class DeviceModule { }
