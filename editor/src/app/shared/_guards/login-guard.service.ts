import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../../core/auth/_services/authentication.service';

@Injectable()
export class LoginGuard implements CanActivate {

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) { }
  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (await this.authenticationService.isLoggedIn()) {
      return true;
    }
    this.router.navigate(['login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}
