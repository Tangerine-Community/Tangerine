import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { RegistrationService } from './registration/services/registration.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    name = 'Tangerine-Hub';
    loggedIn: boolean = false;
    user_id: string = localStorage.getItem('user_id');
    private childValue: string;
    //subTitleToUse: string;
    //subscription: Subscription;
    history: string[] = [];
    pgTitle = "Tangerine Hub";
    pgTagline = "Use this site to manage your Tangerine subscription.";
    pgInstruction = "You can view users of your Tangerine server and their projects.....";
    pgCardTitle = "Welcome!";
    titleToUse: string;

    constructor(
        private _router: Router,
        private _registrationService: RegistrationService,
        private _authService: AuthService
    ) {
    }

    logout() {
        this._registrationService.logout(localStorage.getItem('token'), localStorage.getItem('password')).subscribe(
            data => { this._authService.setLoggedOut(); this._router.navigate(['/login']); }, //or you can use this as in same component it would work: this.loggedIn = false;
            err => console.error('not able to log you out' + err),
            () => console.log('done logout call')
        );
    }

    ngOnInit() {
        //Note: every time a loginstatus changes (by calling setLoggedOut or setLogged in in auth.service in any component ) this
        // code will run as we are subscribing tot the behaviorsubject as an observable
        this._authService.getLoginStatus().subscribe(loginStatus => { console.log('subscription got triggered as observable chagnged or on initial page load');//whenever a new value is set for the subjects this executes as you are subscribing to a subject asObservable
            console.log('getLoginStatusRan: ' + loginStatus.loggedIn);
            this.loggedIn = loginStatus.loggedIn; 
            this.user_id = localStorage.getItem('user_id');//need a refresh to show
        });   
    };

}
