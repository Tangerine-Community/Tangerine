import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from './../_services/authentication.service';
@Injectable()
export class UploadGuardService implements CanActivate {

  constructor(private router: Router, private authenticationService: AuthenticationService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.authenticationService.isLoggedInForUpload()) {
      return true;
    }
    this.router.navigate(['/loginRemoteServer'], { queryParams: { returnUrl: state.url } });
    return false;
  }

}
