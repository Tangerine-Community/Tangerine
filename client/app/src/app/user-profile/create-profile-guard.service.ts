import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { CanActivate } from '@angular/router/src/interfaces';
import { UserService } from '../core/auth/_services/user.service';
import { HttpClient } from '@angular/common/http';
import PouchDB from 'pouchdb';

@Injectable()
export class CreateProfileGuardService implements CanActivate {
  userDatabase;
  DB;
  appConfig;
  constructor(private router: Router, private userService: UserService, private http: HttpClient) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    let isProfileComplete = false;
    this.appConfig = await this.http.get('./assets/app-config.json').toPromise()
    this.userDatabase = await this.userService.getUserDatabase();
    this.DB = new PouchDB(this.userDatabase);
    const results = await this.DB.query('tangy-form/responsesByFormId', {
      key: 'user-profile',
      include_docs: true
    });

    if (results.rows.length === 0) {
      isProfileComplete = false;
    } else {
      const responseDoc = results.rows[0].doc;
      isProfileComplete = responseDoc.items.find(item => {
        return (item.incomplete === true);
      }) ? false : true;
    }

    if (!isProfileComplete) {
      if (this.appConfig.registrationRequiresServerUser) {
        this.router.navigate(['/import-user-profile'], { queryParams: { returnUrl: state.url } });
      } else {
        debugger
        if (state.url !== '/manage-user-profile') {
          this.router.navigate(['/manage-user-profile'], { queryParams: { returnUrl: state.url } });
        }
      }
    }
    return isProfileComplete;
  }

}
