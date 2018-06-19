import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/add/observable/fromPromise';
import { Observable } from 'rxjs/Observable';
import { AuthenticationService } from '../../_services/authentication.service';
import { _TRANSLATE } from '../../../../shared/_services/translation-marker';

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
    private router: Router
  ) { }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || 'projects';
  }

  async loginUser() {
    try {
      const data = await this.authenticationService.login(this.user.username, this.user.password);
      if (data) {
        this.router.navigate([this.returnUrl]);
      } else {
        this.errorMessage = _TRANSLATE('Login Unsuccesful');
      }
    } catch (error) {
      this.errorMessage = _TRANSLATE('Login Unsuccesful');
    }
  }

}
