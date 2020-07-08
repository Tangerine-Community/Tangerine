import { VariableService } from './../../../shared/_services/variable.service';
import { UpdateService, VAR_UPDATE_IS_RUNNING } from './../../../shared/_services/update.service';
import { DeviceService } from './../../../device/services/device.service';

import {from as observableFrom,  Observable } from 'rxjs';


import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from '../../../shared/_services/app-config.service';

import { UserService } from '../../../shared/_services/user.service';
import { _TRANSLATE } from '../../../shared/translation-marker';
import { VARIABLE_FINISH_UPDATE_ON_LOGIN } from '../../update/update/update.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  errorMessage = '';
  adminPassword = ''
  returnUrl: string; // stores the value of the url to redirect to after login
  user = { username: '', password: '', newPassword: '' };
  users = [];
  installed = false
  showRecoveryInput = false;
  securityQuestionText;
  allUsernames;
  listUsernamesOnLoginScreen;
  requiresAdminPassword = false
  passwordPolicy: string
  passwordRecipe: string
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService:UserService,
    private usersService: UserService,
    private variableService:VariableService,
    private appConfigService: AppConfigService
  ) {
    this.installed = localStorage.getItem('installed') ? true : false
  }

  async ngOnInit() {
    const appConfig = await this.appConfigService.getAppConfig();
    const homeUrl = appConfig.homeUrl;
    this.requiresAdminPassword = appConfig.syncProtocol === '2' ? true : false
    this.securityQuestionText = appConfig.securityQuestionText;
    this.listUsernamesOnLoginScreen = appConfig.listUsernamesOnLoginScreen;
    this.passwordPolicy = appConfig.passwordPolicy;
    this.passwordRecipe = appConfig.passwordRecipe;
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

  async resetPassword() {
    this.errorMessage = ''
    if (await this.appConfigService.syncProtocol2Enabled() && !await this.userService.confirmPassword('admin', this.adminPassword)) {
      this.errorMessage = _TRANSLATE('Admin password incorrect.')
      return
    }
    const policy = new RegExp(this.passwordPolicy)
    if (!policy.test(this.user.newPassword)) {
      this.errorMessage = _TRANSLATE('Password is not strong enough.') + ' ' + this.passwordRecipe
      return
    }
    this.user.password = this.user.newPassword
    observableFrom(this.userService.resetPassword(this.user, this.adminPassword)).subscribe(data => {
      if (data) {
        this.router.navigate([this.returnUrl]);
      } else {
        this.errorMessage = _TRANSLATE('Password Reset Unsuccesful');
      }
    }, error => {
      this.errorMessage = _TRANSLATE('Password Reset Unsuccesful');

    });
  }

  // we need to have error msg for admin pass failure
  loginUser() {
    observableFrom(this.userService.login(this.user.username, this.user.password)).subscribe(async data => {
      if (data) {
        if (await this.variableService.get(VAR_UPDATE_IS_RUNNING)) {
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


