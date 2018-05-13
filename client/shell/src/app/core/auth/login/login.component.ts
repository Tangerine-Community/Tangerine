import 'rxjs/add/observable/fromPromise';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppConfigService } from 'app/shared/_services/app-config.service';
import { Observable } from 'rxjs/Observable';

import { UserService } from '../_services/user.service';
import { AuthenticationService } from './../_services/authentication.service';
import { _TRANSLATE } from '../../../shared/translation-marker';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  errorMessage = '';
  returnUrl: string; // stores the value of the url to redirect to after login
  user = { username: '', password: '' };
  users = [];
  showRecoveryInput = false;
  securityQuestionText;
  allUsernames;
  listUsernamesOnLoginScreen;
  constructor(
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UserService,
    private appConfigService: AppConfigService
  ) { }

  async ngOnInit() {
    const appConfig = await this.appConfigService.getAppConfig();
    const homeUrl = appConfig.homeUrl;
    this.securityQuestionText = appConfig.securityQuestionText;
    this.listUsernamesOnLoginScreen = appConfig.listUsernamesOnLoginScreen;
    if (this.listUsernamesOnLoginScreen) {
      this.allUsernames = await this.usersService.getUsernames();
    }
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || homeUrl;
    const isNoPasswordMode = this.authenticationService.isNoPasswordMode();
    // TODO List users on login page
    // Observable.fromPromise(this.usersService.getAllUsers()).subscribe(data => {
    //   this.users = data;
    // });
    if (this.authenticationService.isLoggedIn() || isNoPasswordMode) {
      this.router.navigate([this.returnUrl]);
    }

  }

  async toggleRecoveryInput() {
    this.showRecoveryInput = !this.showRecoveryInput;
  }

  async onSelectUsername(event) {
    this.user.username = event.target.value;
  }

  resetPassword() {
    Observable.fromPromise(this.authenticationService.resetPassword(this.user)).subscribe(data => {
      if (data) {
        this.router.navigate([this.returnUrl]);
      } else {
        this.errorMessage = _TRANSLATE('Password Reset Unsuccesful');
      }
    }, error => {
      this.errorMessage = _TRANSLATE('Password Reset Unsuccesful');

    });
  }
  loginUser() {
    Observable.fromPromise(this.authenticationService.login(this.user.username, this.user.password)).subscribe(data => {
      if (data) {
        this.router.navigate(['' + this.returnUrl]);
      } else {
        this.errorMessage = _TRANSLATE('Login Unsuccesful');
      }
    }, error => {
      this.errorMessage = _TRANSLATE('Login Unsuccesful');

    });
  }

  register(): void {
    this.router.navigate(['/register']);
  }


}


