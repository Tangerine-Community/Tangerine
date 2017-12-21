import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { AuthenticationService } from './../_services/authentication.service';

@Component({
  selector: 'app-login-remote-server',
  templateUrl: './login-remote-server.component.html',
  styleUrls: ['./login-remote-server.component.css']
})
export class LoginRemoteServerComponent implements OnInit {
  returnUrl: string; // stores the value of the url to redirect to after login
  user = { username: '', password: '' };
  constructor(
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }
  loginForUpload(): void {

    Observable.fromPromise(this.authenticationService.loginForUpload(this.user.username, this.user.password)).subscribe(data => {
      if (data) {
        this.router.navigate(['' + this.returnUrl]);
      } else { alert('Login Unsuccessful'); }
    }, error => {
      alert('Login Unsuccessful');

    });
  }
}
