import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild('customLoginMarkup', {static: true}) customLoginMarkup: ElementRef;
  ready = false

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
    // We always want to log in from the "front door". If we log in from path of `/app/<groupId>`, then the global cookie
    // will be tied to that pathname and not available at other pathnames such as `/csv/` that is looking for authentication.
    if (window.location.pathname !== '/') { 
      window.location.pathname = '/'
    }
    this.customLoginMarkup.nativeElement.innerHTML = await this.authenticationService.getCustomLoginMarkup()
    this.ready = true
  }
  async loginUser() {
    try {
      if (await this.authenticationService.login(this.user.username, this.user.password)) {
        this.router.navigate(['/projects']);
      } else {
        this.errorMessage = _TRANSLATE('Login Unsuccessful');
      }
    } catch (error) {
      this.errorMessage = _TRANSLATE('Login Unsuccessful');
      console.error(error);
    }
  }

}
