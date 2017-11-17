import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { CanActivate } from '@angular/router/src/interfaces';

@Injectable()
export class CreateProfileGuardService implements CanActivate {

  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isProfileComplete = true;
    if (isProfileComplete) {
      return true;
    }
    this.router.navigate(['/manage-user-profile'], { queryParams: { returnUrl: state.url } });
    return false;
  }

}
