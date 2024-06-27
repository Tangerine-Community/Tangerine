import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../_services/authentication.service';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';

@Injectable()
export class LoginGuard implements CanActivate {

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private appConfigService: AppConfigService
  ) { }
  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const config = await this.appConfigService.getAppConfig();
    if (config['requireAccessCode'] === 'true') {
      if (await this.authenticationService.isLoggedIn()) {
        return true;
      }
      this.router.navigate(['survey-login'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    return true;
  }
}
