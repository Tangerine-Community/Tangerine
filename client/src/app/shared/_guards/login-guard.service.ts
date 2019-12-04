import { DeviceService } from './../../device/services/device.service';
import { AppConfigService } from './../_services/app-config.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { AuthenticationService } from '../_services/authentication.service';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private deviceService:DeviceService,
    private appConfigService:AppConfigService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authenticationService.isLoggedIn()) {
      return true;
    }
    //  else if (!this.authenticationService.isLoggedIn() && this.authenticationService.isNoPasswordMode()) {
    //   this.router.navigate(['/login-nopassword'], { queryParams: { returnUrl: state.url } });
    //   return true;
    // }
    const appConfig = await this.appConfigService.getAppConfig()
    if (appConfig.associateUserProfileMode === 'local-exists' && !(await this.deviceService.isRegistered())) {
      this.router.navigate(['device-setup'], { queryParams: { returnUrl: state.url } });
    } else {
      this.router.navigate(['login'], { queryParams: { returnUrl: state.url } });
    }
    return false;
  }

}
