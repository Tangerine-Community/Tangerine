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
    const appConfig = await this.appConfigService.getAppConfig() 
    const userAccount = await this.userService.getUserAccount(this.userService.getCurrentUser())
    if (!userAccount.initialProfileComplete) {
      if (appConfig.associateUserProfileMode === 'remote') {
        this.router.navigate(['/import-user-profile'], { queryParams: { returnUrl: state.url } });
      } else if (appConfig.associateUserProfileMode === 'local-exists') {
        this.router.navigate(['/associate-user-profile'], { queryParams: { returnUrl: state.url } });
      } else if (appConfig.associateUserProfileMode === 'local-new' || !appConfig.associateUserProfileMode) {
        if (state.url.substr(0,20) !== '/manage-user-profile') {
          this.router.navigate(['/manage-user-profile'], { queryParams: { returnUrl: state.url } });
        } else {
          return true;
        }
      }
    }
    return true;
  }

}
