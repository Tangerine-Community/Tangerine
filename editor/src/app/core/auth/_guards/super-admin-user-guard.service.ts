import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { TangyErrorHandler } from '../../../shared/_services/tangy-error-handler.service';
import { _TRANSLATE } from '../../../shared/_services/translation-marker';

@Injectable()
export class SuperAdminUserGuard implements CanActivate {

  constructor(
    private router: Router,
    private userService: UserService,
    private errorHandler: TangyErrorHandler
  ) { }
  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (await this.userService.isCurrentUserSuperAdmin()) {
      return true;
    };
    this.errorHandler.handleError(_TRANSLATE('Permission Denied.'));
    this.router.navigate(['projects']);
    return false;
  }
}
