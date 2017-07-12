import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from './../_services/authentication.service';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private router: Router, private authenticationService: AuthenticationService) { }
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authenticationService.isLoggedIn()) { return true; };
    console.log('Can Activate called');
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

}
