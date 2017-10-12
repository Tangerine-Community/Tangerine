import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../_services/authentication.service';
import { UserService } from '../_services/user.service';
import 'rxjs/add/observable/fromPromise';

import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

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
    errorMessage: string;
    constructor(
        private userService: UserService,
        private authenticationService: AuthenticationService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/home';
        const isNoPasswordMode = this.authenticationService.isNoPasswordMode();
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
                this.errorMessage = 'Error creating User';
            });
        } else {
            this.errorMessage = 'Username taken';
        }

    }
    doesUserExist(user) {
        Observable.fromPromise(this.userService.doesUserExist(user)).subscribe((data) => {
            this.isUsernameTaken = data;
            this.isUsernameTaken ? this.errorMessage = 'Username taken' : console.log('Good to go');
            return this.isUsernameTaken;
        });

    }

    loginUserAfterRegistration(username, password) {
        Observable.fromPromise(this.authenticationService.login(username, password)).subscribe(data => {
            if (data) {
                this.router.navigate(['' + this.returnUrl]);
            } else { this.errorMessage = 'Login Unsuccessful'; }
        }, error => {
            this.errorMessage = 'Login Unsuccessful';

        });
    }

}

