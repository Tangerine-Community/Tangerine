import { UserService } from 'src/app/shared/_services/user.service';
import { DeviceService } from './../../device/services/device.service';
import { AppConfigService } from './../_services/app-config.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService,
    private deviceService:DeviceService,
    private appConfigService:AppConfigService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.userService.isLoggedIn()) {
      return true;
    }
    //  else if (!this.authenticationService.isLoggedIn() && this.authenticationService.isNoPasswordMode()) {
    //   this.router.navigate(['/login-nopassword'], { queryParams: { returnUrl: state.url } });
    //   return true;
    // }
    const appConfig = await this.appConfigService.getAppConfig()
    if (appConfig.syncProtocol === '2') {
      const deviceIsRegistered = await this.deviceService.isRegistered()
      if (deviceIsRegistered) {
        this.router.navigate(['login'], { queryParams: { returnUrl: state.url } });
      } else {
        this.router.navigate(['device-setup'], { queryParams: { returnUrl: state.url } });
      }
      
    } else {
      this.router.navigate(['login'], { queryParams: { returnUrl: state.url } });
    }
    return false;
  }

}
