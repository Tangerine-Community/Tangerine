import { AppConfigService } from './../_services/app-config.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { CanActivate } from '@angular/router/src/interfaces';
import { UserService } from '../_services/user.service';

@Injectable()
export class CreateProfileGuardService implements CanActivate {

  constructor(
    private router: Router, 
    private userService: UserService, 
    private appConfigService:AppConfigService
  ) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const userAccount = await this.userService.getUserAccount(this.userService.getCurrentUser())
    if (userAccount.initialProfileComplete) {
      return true
    } else {
      const appConfig = await this.appConfigService.getAppConfig() 
      let navigateUrl = ''
      if (appConfig.centrallyManagedUserProfile === true && (appConfig.syncProtocol === '1' || !appConfig.syncProtocol)) {
        navigateUrl = '/import-user-profile'
      } else if (appConfig.centrallyManagedUserProfile === true && appConfig.syncProtocol === '2') {
        navigateUrl = '/associate-user-profile'
      } else {
        navigateUrl = '/manage-user-profile'
      }
      this.router.navigate([navigateUrl], { queryParams: { returnUrl: state.url } });
    }
  }

}
