import { DeviceService } from './../../services/device.service';
import { UserService } from 'src/app/shared/_services/user.service';
import { DevicePasswordComponent } from './../device-password/device-password.component';
import { Router } from '@angular/router';
import { DeviceLanguageComponent } from './../device-language/device-language.component';
import { DeviceSyncComponent } from './../device-sync/device-sync.component';
import { DeviceRegistrationComponent } from './../device-registration/device-registration.component';
import { Observable, Subject } from 'rxjs';
import { LanguagesService } from './../../../shared/_services/languages.service';
import { Component, OnInit, ViewChild, ElementRef, AfterContentInit } from '@angular/core';
import { UserSignup } from 'src/app/shared/_classes/user-signup.class';
import { LockBoxContents } from 'src/app/shared/_classes/lock-box-contents.class';

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
  @ViewChild('stepLanguageSelect') stepLanguageSelect:DeviceLanguageComponent
  @ViewChild('stepDevicePassword') stepDevicePassword:DevicePasswordComponent
  @ViewChild('stepDeviceRegistration') stepDeviceRegistration:DeviceRegistrationComponent
  @ViewChild('stepDeviceSync') stepDeviceSync:DeviceSyncComponent

  constructor(
    private languagesService:LanguagesService,
    private userService:UserService,
    private deviceService:DeviceService,
    private routerService:Router
  ) { }

  async ngOnInit() {
    let password = ''
    // Initial step. First we ask for the language, then the language step reloads page,
    // that's when language will be set and we go to the next step of setting up a password.
    if (!this.languagesService.userHasSetLanguage()) {
      this.step = STEP_LANGUAGE_SELECT
    } else {
      this.step = STEP_DEVICE_PASSWORD
    }
    // On language select done.
    this.stepLanguageSelect.done$.subscribe(value => {
      window.location.href = window.location.href.replace(window.location.hash, 'index.html')
    })
    // On device admin password set.
    this.stepDevicePassword.done$.subscribe({next: setPassword => {
      password = setPassword
      this.step = STEP_DEVICE_REGISTRATION
    }})
    // On device registration complete.
    this.stepDeviceRegistration.done$.subscribe(async (deviceDoc) => {
      await this.deviceService.register(deviceDoc._id, deviceDoc.token)
      await this.userService.createAdmin(password, <LockBoxContents>{
        device: deviceDoc
      })
      await this.userService.login('admin', password)
      this.step = STEP_SYNC
      this.stepDeviceSync.sync()
    })
    // On device sync.
    this.stepDeviceSync.done$.subscribe(async (value) => {
      await this.userService.logout()
      this.routerService.navigate([''])
    })
    this.ready$.next(true)
  }

}
