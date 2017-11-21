import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { CanActivate } from '@angular/router/src/interfaces';

@Injectable()
export class CreateProfileGuardService implements CanActivate {

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    // @TODO: Check whether profile form is marked as complete and make
    // the isProfileComplete dynamic
    const isProfileComplete = true;
    if (isProfileComplete) {
      return true;
    }
    this.router.navigate(['/manage-user-profile'], { queryParams: { returnUrl: state.url } });
    return false;
  }

}
