import { UserService } from 'src/app/shared/_services/user.service';
import { DeviceService } from './../../device/services/device.service';
import { AppConfigService } from './../_services/app-config.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { VariableService } from '../_services/variable.service';
import { FIRST_SYNC_STATUS } from 'src/app/device/components/device-sync/device-sync.component';

@Injectable()
export class LoginGuard implements CanActivate {
  constructor(
    private router: Router,
    private userService: UserService,
    private deviceService:DeviceService,
    private variableService:VariableService,
    private appConfigService:AppConfigService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const appConfig = await this.appConfigService.getAppConfig()
    if (this.userService.isLoggedIn()) {
      if (appConfig.syncProtocol === '2') {
        if (await this.variableService.get('FIRST_SYNC_STATUS') === FIRST_SYNC_STATUS.IN_PROGRESS) {
          this.router.navigate(['device-resync']);
        } else {
          return true
        }
      } else {
        return true;
      }
    } else {
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
    }
    return false;
  }

}
