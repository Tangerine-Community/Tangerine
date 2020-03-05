import { MenuService } from './shared/_services/menu.service';
import { Component, OnInit, ChangeDetectorRef, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from './core/auth/_services/authentication.service';
import { RegistrationService } from './registration/services/registration.service';
import { WindowRef } from './core/window-ref.service';
import { MediaMatcher } from '@angular/cdk/layout';
import { HttpClient } from '@angular/common/http';
import { MatSidenav } from '@angular/material';
import { UserService } from './core/auth/_services/user.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
    loggedIn = false;
    validSession: boolean;
    user_id: string = localStorage.getItem('user_id');
    private childValue: string;
    canManageSitewideUsers = false
    isAdminUser = false
    history: string[] = [];
    titleToUse: string;
    mobileQuery: MediaQueryList;
    window:any

    @ViewChild('snav') snav: MatSidenav

    private _mobileQueryListener: () => void;
    constructor(
        private windowRef: WindowRef,
        private router: Router,
        private _registrationService: RegistrationService,
        private userService:UserService,
        private menuService:MenuService,
        private authenticationService: AuthenticationService,
        translate: TranslateService,
        changeDetectorRef: ChangeDetectorRef,
        media: MediaMatcher,
        private http: HttpClient
    ) {
        translate.setDefaultLang('translation');
        translate.use('translation');
        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
        this.window = this.windowRef.nativeWindow;
    }

    async logout() {
        await this.authenticationService.logout();
        this.router.navigate(['login']);
        this.window.location.reload()
    }

    async ngOnInit() {
        // Ensure user is logged in every 60 seconds.
        await this.ensureLoggedIn();
        setInterval(() => this.ensureLoggedIn(), 60 * 1000);
        this.authenticationService.currentUserLoggedIn$.subscribe(async isLoggedIn => {
            this.isAdminUser = await this.userService.isCurrentUserAdmin()
            this.loggedIn = isLoggedIn;
            this.user_id = localStorage.getItem('user_id');
            this.canManageSitewideUsers = <boolean>await this.http.get('/user/permission/can-manage-sitewide-users').toPromise()
            if (!isLoggedIn) { this.router.navigate(['login']); }
        });

        this.snav.toggle()

        fetch('assets/translation.json')
          .then(response => response.json())
          .then(json => {
            console.log("populating window.translation.")
            this.window.translation = json
          })
    }

    async ensureLoggedIn() {
        this.loggedIn = await this.authenticationService.isLoggedIn();
        if (this.loggedIn && await this.authenticationService.validateSession() === false) {
            console.log('found invalid session');
            this.isAdminUser = false
            this.canManageSitewideUsers = false
            this.logout();
        }
    }
    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener);
    }

}
