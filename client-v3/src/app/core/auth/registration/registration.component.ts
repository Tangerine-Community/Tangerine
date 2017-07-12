import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './../_services/user.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {

  user: any;
  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  register(): void {
    Observable.fromPromise(this.userService.create(this.user)).subscribe(data => {
      this.router.navigate(['/login']);
    }, error => {
      alert('Error creating User');
    });
  }

}
