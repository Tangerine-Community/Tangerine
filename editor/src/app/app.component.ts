import { TangyFormService } from './tangy-forms/tangy-form.service';
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
import { AppConfigService } from './shared/_services/app-config.service';


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

    @ViewChild('snav', {static: true}) snav: MatSidenav

    private _mobileQueryListener: () => void;
    constructor(
        private windowRef: WindowRef,
        private router: Router,
        private _registrationService: RegistrationService,
        private userService:UserService,
        private menuService:MenuService,
        private authenticationService: AuthenticationService,
        private tangyFormService:TangyFormService,
        translate: TranslateService,
        changeDetectorRef: ChangeDetectorRef,
        media: MediaMatcher,
        private appConfigService: AppConfigService
    ) {
        translate.setDefaultLang('translation');
        translate.use('translation');
        this.mobileQuery = media.matchMedia('(max-width: 600px)');
        this.mobileQuery.addEventListener('change', (event => this.snav.opened = !event.matches))
        this._mobileQueryListener = () => changeDetectorRef.detectChanges();
        this.mobileQuery.addListener(this._mobileQueryListener);
        this.window = this.windowRef.nativeWindow;
        // Tell tangyFormService which groupId to use.
        tangyFormService.initialize(window.location.pathname.split('/')[2])
 
    }

    async logout() {
        await this.authenticationService.logout();
        this.loggedIn = false;
        this.isAdminUser = false;
        this.canManageSitewideUsers = false;
        this.user_id = null;
        this.router.navigate(['/login']);
    }

    async ngOnInit() {
        this.authenticationService.currentUserLoggedIn$.subscribe(async isLoggedIn => {
            if (isLoggedIn) {
                this.loggedIn = isLoggedIn;
                this.isAdminUser = await this.userService.isCurrentUserAdmin();
                this.user_id = localStorage.getItem('user_id');
                this.canManageSitewideUsers = await this.userService.canManageSitewideUsers();
            } else {
                this.loggedIn = false;
                this.isAdminUser = false;
                this.canManageSitewideUsers = false;
                this.user_id = null;
                this.router.navigate(['/login']);
            }
        });
        this.window.translation = await this.appConfigService.getTranslations();
    }
    ngOnDestroy(): void {
        this.mobileQuery.removeListener(this._mobileQueryListener);
    }

}
