import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './../_services/user.service';
import { Observable } from 'rxjs/Observable';
import { User } from './../_services/user.model';
import 'rxjs/add/observable/fromPromise';
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  user: User;
  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  onSubmit(tangerineForm): void {
    const model = tangerineForm.model;
    this.user = {
      username: model.username,
      password: model.password,
      email: model.email
    };
    Observable.fromPromise(this.userService.create(this.user)).subscribe(data => {
      this.router.navigate(['/login']);
    }, error => {
      alert('Error creating User');
    });
  }

}
