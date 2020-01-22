import { DevicePasswordComponent } from './../device-password/device-password.component';
import { Router } from '@angular/router';
import { DeviceLanguageComponent } from './../device-language/device-language.component';
import { DeviceSyncComponent } from './../device-sync/device-sync.component';
import { DeviceRegistrationComponent } from './../device-registration/device-registration.component';
import { Observable, Subject } from 'rxjs';
import { LanguagesService } from './../../../shared/_services/languages.service';
import { Component, OnInit, ViewChild, ElementRef, AfterContentInit } from '@angular/core';

const STEP_LANGUAGE_SELECT = 'STEP_LANGUAGE_SELECT'
const STEP_DEVICE_PASSWORD = 'STEP_DEVICE_PASSWORD'
const STEP_DEVICE_REGISTRATION = 'STEP_DEVICE_REGISTRATION'
const STEP_SYNC = 'STEP_SYNC'

@Component({
  selector: 'app-device-setup',
  templateUrl: './device-setup.component.html',
  styleUrls: ['./device-setup.component.css']
})
export class DeviceSetupComponent implements OnInit {

  ready$ = new Subject()
  step:string
  // Prevent reloads required by changing languagr during testing.
  testing = false
  @ViewChild('stepLanguageSelect') stepLanguageSelect:DeviceLanguageComponent
  @ViewChild('stepDevicePassword') stepDevicePassword:DevicePasswordComponent
  @ViewChild('stepDeviceRegistration') stepDeviceRegistration:DeviceRegistrationComponent
  @ViewChild('stepDeviceSync') stepDeviceSync:DeviceSyncComponent

  constructor(
    private languagesService:LanguagesService,
    private routerService:Router
  ) { }

  async ngOnInit() {
    // Initial step.
    if (!this.languagesService.userHasSetLanguage()) {
      this.step = STEP_LANGUAGE_SELECT
    } else {
      this.step = STEP_DEVICE_PASSWORD
    }
    // Listen to when steps are done.
    this.stepLanguageSelect.done$.subscribe(value => {
      if (!this.testing) {
        window.location.href = window.location.href.replace(window.location.hash, 'index.html')
      } else {
        this.step = STEP_DEVICE_PASSWORD
      }
    })
    this.stepDevicePassword.done$.subscribe(value => {
      this.step = STEP_DEVICE_REGISTRATION
    })
    this.stepDeviceRegistration.done$.subscribe((value) => {
      if (value === true) {
        this.step = STEP_SYNC
        this.stepDeviceSync.sync()
      }
    })
    this.stepDeviceSync.done$.subscribe((value) => {
      this.routerService.navigate([''])
    })
    this.ready$.next(true)

  }

}
