import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
    const isAnonymousMode = this.authenticationService.getSecurityPolicy().find(policy => policy === 'anonymouss');

    if (this.authenticationService.isLoggedIn() || isAnonymousMode === 'anonymous') {
      this.router.navigate([this.returnUrl]);
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.returnUrl } });
    }

  }
  login(): void {
    this.loading = true;
    this.authenticationService.login(this.user.username, this.user.password).subscribe(data => {
      this.router.navigate([this.returnUrl]);
    }, error => {
      this.loading = false;
      alert('Login Unsuccessful');

    });
  }


}


