import { DeviceService } from './../../../device/services/device.service';

import {from as observableFrom,  Observable } from 'rxjs';


import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from '../../../shared/_services/app-config.service';

import { UserService } from '../../../shared/_services/user.service';
import { _TRANSLATE } from '../../../shared/translation-marker';
import { UserSignup } from 'src/app/shared/_classes/user-signup.class';


@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

    userSignup:UserSignup = new UserSignup({})
    requiresAdminPassword = false
    isUsernameTaken: boolean;
    returnUrl: string;
    statusMessage = { type: '', message: '' };
    disableSubmit = false;
    passwordsDoNotMatchMessage = { type: 'error', message: _TRANSLATE('Passwords do not match') };
    passwordIsNotStrong = { type: 'error', message: _TRANSLATE('Password is not strong enough.') };
    devicePasswordDoesNotMatchMessage = { type: 'error', message: _TRANSLATE('Device password does not match') };
    userNameUnavailableMessage = { type: 'error', message: _TRANSLATE('Username Unavailable') };
    userNameAvailableMessage = { type: 'success', message: _TRANSLATE('Username Available') };
    loginUnsucessfulMessage = { type: 'error', message: _TRANSLATE('Login Unsuccesful') };
    couldNotCreateUserMessage = { type: 'error', message: _TRANSLATE('Could Not Create User') };
    incorrectAdminPassword = { type: 'error', message: _TRANSLATE('Incorrect Admin Password') };
    securityQuestionText: string;
    passwordPolicy: string
    passwordRecipe: string
    constructor(
        private userService: UserService,
        private route: ActivatedRoute,
        private router: Router,
        private appConfigService: AppConfigService
    ) {
        this.statusMessage = { type: '', message: '' };
    }
    async ngOnInit() {
        const appConfig = await this.appConfigService.getAppConfig();
        this.requiresAdminPassword = appConfig.syncProtocol === '2' ? true : false
        const homeUrl = appConfig.homeUrl;
        this.securityQuestionText = appConfig.securityQuestionText;
        this.passwordPolicy = appConfig.passwordPolicy;
        this.passwordRecipe = appConfig.passwordRecipe;
        this.passwordIsNotStrong.message = this.passwordIsNotStrong.message + ' ' + this.passwordRecipe
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || homeUrl;
        if (this.userService.isLoggedIn()) {
            this.router.navigate([this.returnUrl]);
        }
    }

    async register() {
        this.disableSubmit = true
        if (!this.userSignup.username) {
            this.statusMessage = _TRANSLATE(`Username is required`)
            this.disableSubmit = false
            return
        }
        if (!this.userSignup.password) {
            this.statusMessage = _TRANSLATE(`Password is required`) 
            this.disableSubmit = false
            return
        }
        if (!this.userSignup.confirmPassword) {
            this.statusMessage = _TRANSLATE(`Confirm Password is required`) 
            this.disableSubmit = false
            return
        }
        if (this.requiresAdminPassword && !this.userService.confirmPassword('admin', this.userSignup.adminPassword)) {
            this.statusMessage = this.devicePasswordDoesNotMatchMessage
            this.disableSubmit = false
            return
        }
        if (this.userSignup.password!==this.userSignup.confirmPassword) {
            this.statusMessage = this.passwordsDoNotMatchMessage
            this.disableSubmit = false
            return
        }
      // const policy = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})');
        const policy = new RegExp(this.passwordPolicy)
        if (!policy.test(this.userSignup.password)) {
          this.statusMessage = this.passwordIsNotStrong
          this.disableSubmit = false
          return
        }
        if (!this.isUsernameTaken) {
            try {
                await this.userService.create(this.userSignup)
                this.loginUserAfterRegistration(this.userSignup.username, this.userSignup.password);
            } catch (error) {
                console.log(error);
                if (error.message === 'Malformed UTF-8 data') {
                  this.statusMessage = this.incorrectAdminPassword;
                } else {
                  this.statusMessage = this.couldNotCreateUserMessage;
                }
                this.disableSubmit = false
            };
        } else {
            this.statusMessage = this.userNameUnavailableMessage;
            this.disableSubmit = false
        }
    }

    async doesUserExist(user) {
      this.userSignup.username = user.replace(/\s/g, ''); // Remove all whitespaces including spaces and tabs
      try {
        let data = await this.userService.doesUserExist(user.replace(/\s/g, ''));
        this.isUsernameTaken = data;
        this.isUsernameTaken ?
            this.statusMessage = this.userNameUnavailableMessage :
            this.statusMessage = this.userNameAvailableMessage;
        return this.isUsernameTaken;

      } catch (error) {
        console.log(error)
      }
    }

    // Prevent native `submit` events from POSTing beause this crashes APKs.
    greaseTrap(event) {
        event.preventDefault()
    }

    async loginUserAfterRegistration(username, password) {
        await this.userService.login(username, password)
        this.router.navigate(['' + '/manage-user-profile']);
    }

}

