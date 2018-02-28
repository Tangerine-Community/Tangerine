import 'rxjs/add/observable/fromPromise';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from 'app/shared/_services/app-config.service';
import { Observable } from 'rxjs/Observable';

import { AuthenticationService } from '../_services/authentication.service';
import { UserService } from '../_services/user.service';
import { User } from './../_services/user.model.interface';


@Component({
    selector: 'app-registration',
    templateUrl: './registration.component.html',
    styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

    user = <User>{
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    };
    isUsernameTaken: boolean;
    returnUrl: string;
    statusMessage: object;
    userNameUnavailableMessage = { type: 'error', message: 'Username Unavailable.' };
    userNameAvailableMessage = { type: 'success', message: 'Username Available.' };
    loginUnsucessfulMessage = { type: 'error', message: 'Login Unsuccessful' };
    couldNotCreateUserMessage = { type: 'error', message: 'Could Not Create User' };
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
        const home_url = await this.appConfigService.getDefaultURL();
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || home_url;
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

