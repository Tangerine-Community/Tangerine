import { AuthenticationService } from './../../../shared/_services/authentication.service';
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
import { LockerContents } from 'src/app/shared/_classes/locker-contents.class';

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
    private authService:AuthenticationService,
    private routerService:Router
  ) { }

  async ngOnInit() {
    let password = ''
    let deviceDoc = {}
    // Initial step.
    if (!this.languagesService.userHasSetLanguage()) {
      this.step = STEP_LANGUAGE_SELECT
    } else {
      this.step = STEP_DEVICE_PASSWORD
    }

    // Listen to when steps are done.
    this.stepLanguageSelect.done$.subscribe(value => {
      window.location.href = window.location.href.replace(window.location.hash, 'index.html')
    })

    this.stepDevicePassword.done$.subscribe({next: setPassword => {
      password = setPassword
      this.step = STEP_DEVICE_REGISTRATION
    }})

    this.stepDeviceRegistration.done$.subscribe(async (deviceDoc) => {
      await this.userService.installSharedUserDatabase(deviceDoc)
      await this.userService.createAdmin(password, <LockerContents>{
        device: deviceDoc
      })
      await this.authService.login('admin', password)
      this.step = STEP_SYNC
      this.stepDeviceSync.sync()
    })

    this.stepDeviceSync.done$.subscribe(async (value) => {
      await this.authService.logout()
      this.routerService.navigate([''])
    })
    this.ready$.next(true)

  }

}
