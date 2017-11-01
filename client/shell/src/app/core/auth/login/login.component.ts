import 'rxjs/add/observable/fromPromise';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AppSettings } from '../../../config/app-settings';
import { UserService } from '../_services/user.service';
import { AuthenticationService } from './../_services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loading = false;
  errorMessage = '';
  returnUrl: string; // stores the value of the url to redirect to after login
  user = { username: '', password: '' };
  users = [];
  constructor(
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UserService
  ) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || AppSettings.HOME_URL;
    const isNoPasswordMode = this.authenticationService.isNoPasswordMode();
    // TODO List users on login page
    // Observable.fromPromise(this.usersService.getAllUsers()).subscribe(data => {
    //   this.users = data;
    // });
    if (this.authenticationService.isLoggedIn() || isNoPasswordMode) {
      this.router.navigate([this.returnUrl]);
    }

  }
  login(): void {
    this.loading = true;
    Observable.fromPromise(this.authenticationService.login(this.user.username, this.user.password)).subscribe(data => {
      if (data) {
        this.router.navigate(['' + this.returnUrl]);
      } else {
        this.errorMessage = 'Login Unsuccessful';
      }
    }, error => {
      this.loading = false;
      this.errorMessage = 'Login Unsuccessful';

    });
  }

  register(): void {
    this.router.navigate(['/register']);
  }


}


