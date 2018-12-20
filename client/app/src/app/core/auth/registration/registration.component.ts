
import {from as observableFrom,  Observable } from 'rxjs';


import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from '../../../shared/_services/app-config.service';

import { AuthenticationService } from '../_services/authentication.service';
import { UserService } from '../_services/user.service';
import { User } from './../_services/user.model.interface';
import { _TRANSLATE } from '../../../shared/translation-marker';


@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

    user = <User>{
        username: '',
        password: '',
        confirmPassword: '',
        securityQuestionResponse: '',
        hashSecurityQuestionResponse: true
    };
    isUsernameTaken: boolean;
    returnUrl: string;
    statusMessage: object;
    disableSubmit = false;
    passwordsDoNotMatchMessage = { type: 'error', message: _TRANSLATE('Passwords do not match') };
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
        const homeUrl = appConfig.homeUrl;
        this.securityQuestionText = appConfig.securityQuestionText;
        this.user.hashSecurityQuestionResponse = appConfig.hashSecurityQuestionResponse;
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || homeUrl;
        const isNoPasswordMode = await this.authenticationService.isNoPasswordMode();
        if (isNoPasswordMode) {

        }
        if (this.authenticationService.isLoggedIn() || isNoPasswordMode) {
            this.router.navigate([this.returnUrl]);
        }
    }

    register(): void {
        this.disableSubmit = true
        if (this.user.password!==this.user.confirmPassword) {
            this.statusMessage = this.passwordsDoNotMatchMessage
            this.disableSubmit = false
            return 
        }
        const userData = Object.assign({}, this.user);
        if (!this.isUsernameTaken) {
            observableFrom(this.userService.create(userData)).subscribe(data => {
                this.loginUserAfterRegistration(userData.username, this.user.password);
            }, error => {
                console.log(error);
                this.statusMessage = this.couldNotCreateUserMessage;
            });
        } else {
            this.statusMessage = this.userNameUnavailableMessage;
            this.disableSubmit = false
        }

    }
    async doesUserExist(user) {
      this.user.username = user.replace(/\s/g, ''); // Remove all whitespaces including spaces and tabs
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

    loginUserAfterRegistration(username, password) {
        observableFrom(this.authenticationService.login(username, password)).subscribe(data => {
            if (data) {
                this.router.navigate(['' + '/manage-user-profile']);
            } else { this.statusMessage = this.loginUnsucessfulMessage; }
        }, error => {
            this.statusMessage = this.loginUnsucessfulMessage;
        });
    }
}

