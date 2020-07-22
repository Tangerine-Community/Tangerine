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
  @ViewChild('stepLanguageSelect', {static: true}) stepLanguageSelect:DeviceLanguageComponent
  @ViewChild('stepDevicePassword', {static: true}) stepDevicePassword:DevicePasswordComponent
  @ViewChild('stepDeviceRegistration', {static: true}) stepDeviceRegistration:DeviceRegistrationComponent
  @ViewChild('stepDeviceSync', {static: true}) stepDeviceSync:DeviceSyncComponent

  constructor(
    private languagesService:LanguagesService,
    private userService:UserService,
    private deviceService:DeviceService,
    private routerService:Router
  ) { }

  async ngOnInit() {
    const isSandbox = window.location.hostname === 'localhost' ? true : false
    if (isSandbox) {
      const device = await this.deviceService.register('test', 'test', true)
      await this.userService.installSharedUserDatabase(device)
      await this.userService.createAdmin('password', <LockBoxContents>{
        device
      })
      await this.userService.login('admin', 'password')
      this.routerService.navigate([''])
    } else {
      let password = ''
      // Initial step. First we ask for the language, then the language step reloads page,
      // that's when language will be set and we go to the next step of setting up a password.
      if (!await this.languagesService.userHasSetLanguage()) {
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
        const device = await this.deviceService.register(deviceDoc._id, deviceDoc.token)
        // Note that device.token has been reset so important to use the device record
        // that register returned.
        await this.deviceService.didUpdate(device._id, device.token)
        await this.userService.installSharedUserDatabase(device)
        await this.userService.createAdmin(password, <LockBoxContents>{
          device
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
    }
    this.ready$.next(true)
  }

}
