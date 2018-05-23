import { Injectable }       from '@angular/core';
import {
  CanActivate, 
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot
}                           from '@angular/router';
import { AuthService }      from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;

    let loginStatusCall = this.authService.getSession(localStorage.getItem('token'), localStorage.getItem('password'))
        .subscribe(
        data => { console.log('data returned from getSession call: ' + JSON.stringify(data)); this.authService.setLoggedIn(); },//this.result = data,
        //on err we are doing a delayed redirect as session has espired for some reason like server restart. (also removing localstorage userid here as if set default value for observable is true for logged in in auth.service.ts)
        err => {
          if (err.status && err.status == 401) {
            this.authService.setLoggedOut();
            localStorage.removeItem('user_id');
            console.log('delayed logout so redirect happens on expired session restart server');
            this.router.navigate(['/login']);
          }
          },
        //returns status 401 if not logged in 
        () => {
            console.log('done authguard loginstatuscall')
          }
        );
    return this.checkLogin(url);
  }

  checkLogin(url: string): boolean {
    if (this.authService.isLoggedIn) { return true; }

    // Store the attempted URL for redirecting
    this.authService.redirectUrl = url;
    console.log('jw note: redirect through checkLogin in service. URL: ' + url);
    // Navigate to the login page with extras
    this.router.navigate(['/login']);
    return false;
  }
}

