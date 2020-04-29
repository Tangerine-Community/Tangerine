import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../_services/authentication.service';
import { _TRANSLATE } from '../../../../shared/_services/translation-marker';
import { WindowRef } from 'src/app/core/window-ref.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  errorMessage = '';
  returnUrl: string; // stores the value of the url to redirect to after login
  user = { username: '', password: '' };
  constructor(
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private router: Router,
  ) { }

  async ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || 'projects';
    if (await this.authenticationService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }
  async loginUser() {
    try {
      if (await this.authenticationService.login(this.user.username, this.user.password)) {
        this.router.navigate(['/projects']);
      } else {
        this.errorMessage = _TRANSLATE('Login Unsuccesful');
      }
    } catch (error) {
      this.errorMessage = _TRANSLATE('Login Unsuccesful');
      console.error(error);
    }
  }

}
