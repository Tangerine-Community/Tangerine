import 'rxjs/add/observable/fromPromise';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from 'app/shared/_services/app-config.service';
import { Observable } from 'rxjs/Observable';

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
        delete this.user.confirmPassword;
        const userData = Object.assign({}, this.user);
        if (!this.isUsernameTaken) {
            Observable.fromPromise(this.userService.create(userData)).subscribe(data => {
                this.loginUserAfterRegistration(userData.username, this.user.password);
            }, error => {
                console.log(error);
                this.statusMessage = this.couldNotCreateUserMessage;
            });
        } else {
            this.statusMessage = this.userNameUnavailableMessage;
        }

    }
    doesUserExist(user) {
        this.user.username = user.replace(/\s/g, ''); // Remove all whitespaces including spaces and tabs
        Observable.fromPromise(this.userService.doesUserExist(user.replace(/\s/g, ''))).subscribe((data) => {
            this.isUsernameTaken = data;
            this.isUsernameTaken ?
                this.statusMessage = this.userNameUnavailableMessage :
                this.statusMessage = this.userNameAvailableMessage;
            return this.isUsernameTaken;
        });
    }

    loginUserAfterRegistration(username, password) {
        Observable.fromPromise(this.authenticationService.login(username, password)).subscribe(data => {
            if (data) {
                this.router.navigate(['' + '/manage-user-profile']);
            } else { this.statusMessage = this.loginUnsucessfulMessage; }
        }, error => {
            this.statusMessage = this.loginUnsucessfulMessage;
        });
    }
}

