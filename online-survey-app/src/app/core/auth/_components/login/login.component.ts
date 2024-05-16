import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../../_services/authentication.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';


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
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || 'forms-list';

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

      if (window.location.origin.startsWith('http://localhost')) {
        // If we are running on localhost, we want to use the local server for authentication 
        this.router.navigate([this.returnUrl]);
  
      } else if (await this.authenticationService.login(this.user.username, this.user.password)) {
        this.router.navigate([this.returnUrl]);
      } else {
        this.errorMessage = _TRANSLATE('Login Unsuccesful');
      }
    } catch (error) {
      this.errorMessage = _TRANSLATE('Login Unsuccesful');
      console.error(error);
    }
  }

}
