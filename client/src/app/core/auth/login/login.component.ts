import { UpdateService } from './../../../shared/_services/update.service';
import { DeviceService } from './../../../device/services/device.service';

import {from as observableFrom,  Observable } from 'rxjs';


import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from '../../../shared/_services/app-config.service';

import { UserService } from '../../../shared/_services/user.service';
import { _TRANSLATE } from '../../../shared/translation-marker';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  errorMessage = '';
  devicePassword = ''
  requiresDevicePasswordToRecover
  returnUrl: string; // stores the value of the url to redirect to after login
  user = { username: '', password: '' };
  users = [];
  installed = false
  showRecoveryInput = false;
  securityQuestionText;
  allUsernames;
  listUsernamesOnLoginScreen;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService:UserService,
    private usersService: UserService,
    private deviceService:DeviceService,
    private updateService:UpdateService,
    private appConfigService: AppConfigService
  ) {
    this.installed = localStorage.getItem('installed') ? true : false
  }

  async ngOnInit() {
    const appConfig = await this.appConfigService.getAppConfig();
    const homeUrl = appConfig.homeUrl;
    this.requiresDevicePasswordToRecover = this.deviceService.passwordIsSet()
    this.securityQuestionText = appConfig.securityQuestionText;
    this.listUsernamesOnLoginScreen = appConfig.listUsernamesOnLoginScreen;
    if (this.listUsernamesOnLoginScreen) {
      this.allUsernames = await this.usersService.getUsernames();
    }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || homeUrl;
    if (this.userService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }

  }

  async toggleRecoveryInput() {
    this.showRecoveryInput = !this.showRecoveryInput;
  }

  resetPassword() {
    if (!this.deviceService.verifyPassword(this.devicePassword)) {
      this.errorMessage = _TRANSLATE('Device password incorrect.')
      return
    }
    observableFrom(this.userService.resetPassword(this.user, this.devicePassword)).subscribe(data => {
      if (data) {
        this.router.navigate([this.returnUrl]);
      } else {
        this.errorMessage = _TRANSLATE('Password Reset Unsuccesful');
      }
    }, error => {
      this.errorMessage = _TRANSLATE('Password Reset Unsuccesful');

    });
  }

  loginUser() {
    observableFrom(this.userService.login(this.user.username, this.user.password)).subscribe(async data => {
      if (data) {
        if (await this.appConfigService.syncProtocol2Enabled() && await this.updateService.sp2_updateRequired()) {
          this.router.navigate(['/update']);
        } else {
          this.router.navigate(['' + this.returnUrl]);
        }
      } else {
        this.errorMessage = _TRANSLATE('Login Unsuccesful');
      }
    }, error => {
      this.errorMessage = _TRANSLATE('Login Unsuccesful');

    });
  }

  register(): void {
    this.router.navigate(['/register']);
  }


}


