import 'rxjs/add/observable/fromPromise';
import { User } from './../_services/user.model.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../_services/authentication.service';
import { UserService } from '../_services/user.service';
import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

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

  register(registrationForm): void {
    this.user = {
      username: registrationForm.username,
      password: registrationForm.password,
      email: registrationForm.email,
    };
    Observable.fromPromise(this.userService.create(this.user)).subscribe(data => {
      this.loginUserAfterRegistration(registrationForm.username, registrationForm.password);
    }, error => {
      console.log(error);
      alert('Error creating User');
    });
  }
  doesUserExist(user) {
    Observable.fromPromise(this.userService.doesUserExist(user)).subscribe((data) => {
      this.isUsernameTaken = data;
      this.isUsernameTaken ? alert('Username taken') : console.log('Good to go');
      return this.isUsernameTaken;
    });

  }

  loginUserAfterRegistration(username, password) {
    Observable.fromPromise(this.authenticationService.login(username, password)).subscribe(data => {
      if (data) {
        this.router.navigate(['' + this.returnUrl]);
      } else { alert('Login Unsuccessful'); }
    }, error => {
      alert('Login Unsuccessful');

    });
  }

}
