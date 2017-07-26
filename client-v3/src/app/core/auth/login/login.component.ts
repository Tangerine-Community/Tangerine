import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import { AuthenticationService } from './../_services/authentication.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loading = false;
  returnUrl: string; // stores the value of the url to redirect to after login
  user = { username: '', password: '' };
  constructor(
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    const isAnonymousMode = this.authenticationService.getSecurityPolicy().find(policy => policy === 'anonymous');

    if (this.authenticationService.isLoggedIn() || isAnonymousMode === 'anonymous') {
      this.router.navigate([this.returnUrl]);
    }
    /**
     * @TODO is this really necessary? May need to clean up
     */
    // else {
    //   this.router.navigate(['/create-nodes'], { queryParams: { returnUrl: this.returnUrl } });
    // }

  }
  login(): void {
    this.loading = true;
    Observable.fromPromise(this.authenticationService.login(this.user.username, this.user.password)).subscribe(data => {
      if (data) {
        this.router.navigate(['' + this.returnUrl]);
      } else { alert('Login Unsuccessful'); }
    }, error => {
      this.loading = false;
      alert('Login Unsuccessful');

    });
  }

  register(): void {
    this.router.navigate(['/register']);
  }


}


