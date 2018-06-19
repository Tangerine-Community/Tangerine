import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from './core/auth/_services/authentication.service';
import { RegistrationService } from './registration/services/registration.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    loggedIn = false;
    user_id: string = localStorage.getItem('user_id');
    private childValue: string;

    history: string[] = [];
    titleToUse: string;

    constructor(
        private router: Router,
        private _registrationService: RegistrationService,
        private authenticationService: AuthenticationService,
        translate: TranslateService
    ) {
        translate.setDefaultLang('translation');
        translate.use('translation');
    }

    async logout() {
        await this.authenticationService.logout();
        this.router.navigate(['login']);
    }

    async ngOnInit() {

        this.loggedIn = await this.authenticationService.isLoggedIn();

        this.authenticationService.currentUserLoggedIn$.subscribe(isLoggedIn => {
            this.loggedIn = isLoggedIn;
            this.user_id = localStorage.getItem('user_id');
        });
    };

}
