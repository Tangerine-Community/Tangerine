import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from './../../../shared/_services/authentication.service';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private router: Router, private authenticationService: AuthenticationService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authenticationService.isLoggedIn()) {
      return true;
    }
    //  else if (!this.authenticationService.isLoggedIn() && this.authenticationService.isNoPasswordMode()) {
    //   this.router.navigate(['/login-nopassword'], { queryParams: { returnUrl: state.url } });
    //   return true;
    // }
    this.router.navigate(['login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

}
