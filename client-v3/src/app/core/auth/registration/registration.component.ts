import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './../_services/user.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
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
  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  register(registrationForm): void {
    this.user = {
      username: registrationForm.username,
      password: registrationForm.password,
      email: registrationForm.email,
    };
    Observable.fromPromise(this.userService.create(this.user)).subscribe(data => {
      this.router.navigate(['/login']);
    }, error => {
      console.log(error);
      alert('Error creating User');
    });
  }
  userExists(user) {
    Observable.fromPromise(this.userService.doesUserExist(user)).subscribe((data) => {
      this.isUsernameTaken = data;
      this.isUsernameTaken ? alert('Username taken') : console.log('Good to go');
      return this.isUsernameTaken;
    });

  }

}
