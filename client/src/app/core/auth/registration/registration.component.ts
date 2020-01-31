import { DeviceService } from './../../../device/services/device.service';

import {from as observableFrom,  Observable } from 'rxjs';


import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from '../../../shared/_services/app-config.service';

import { AuthenticationService } from '../../../shared/_services/authentication.service';
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
    statusMessage: object;
    disableSubmit = false;
    passwordsDoNotMatchMessage = { type: 'error', message: _TRANSLATE('Passwords do not match') };
    devicePasswordDoesNotMatchMessage = { type: 'error', message: _TRANSLATE('Device password does not match') };
    userNameUnavailableMessage = { type: 'error', message: _TRANSLATE('Username Unavailable') };
    userNameAvailableMessage = { type: 'success', message: _TRANSLATE('Username Available') };
    loginUnsucessfulMessage = { type: 'error', message: _TRANSLATE('Login Unsuccesful') };
    couldNotCreateUserMessage = { type: 'error', message: _TRANSLATE('Could Not Create User') };
    securityQuestionText: string;
    constructor(
        private userService: UserService,
        private authenticationService: AuthenticationService,
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
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || homeUrl;
        if (this.authenticationService.isLoggedIn()) {
            this.router.navigate([this.returnUrl]);
        }
    }

    async register() {
        this.disableSubmit = true
        if (this.requiresAdminPassword && !this.authenticationService.confirmPassword('admin', this.userSignup.adminPassword)) {
            this.statusMessage = this.devicePasswordDoesNotMatchMessage 
            this.disableSubmit = false
            return
        } 
        if (this.userSignup.password!==this.userSignup.confirmPassword) {
            this.statusMessage = this.passwordsDoNotMatchMessage
            this.disableSubmit = false
            return 
        }
        if (!this.isUsernameTaken) {
            try {
                await this.userService.create(this.userSignup)
                this.loginUserAfterRegistration(this.userSignup.username, this.userSignup.password);
            } catch (error) {
                console.log(error);
                this.statusMessage = this.couldNotCreateUserMessage;
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
        await this.authenticationService.login(username, password)
        this.router.navigate(['' + '/manage-user-profile']);
    }

}

