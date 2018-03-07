import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { CanActivate } from '@angular/router/src/interfaces';
import { UserService } from 'app/core/auth/_services/user.service';
import PouchDB from 'pouchdb';

@Injectable()
export class CreateProfileGuardService implements CanActivate {
  userDatabase;
  DB;
  constructor(private router: Router, private userService: UserService) { }

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    console.log("We're in the ProfileGuardService")
    let isProfileComplete = false;
    this.userDatabase = await this.userService.getUserDatabase();
    this.DB = new PouchDB(this.userDatabase);
    const results = await this.DB.query('tangy-form/responsesByFormId', {
      key: 'user-profile',
      include_docs: true
    });

    if (results.rows.length === 0) {
      isProfileComplete = false;
    } else {
      const responseDoc = results.rows[0].doc
      isProfileComplete = responseDoc.items.find(item => {
        return (item.incomplete === true);
      }) ? false : true;
    }

    if (!isProfileComplete) {
      console.log("Oh no, the ProfileGuardService rejected your profile 'cause it ain't complete. Saaaaawwwy.")
      this.router.navigate(['/manage-user-profile'], { queryParams: { returnUrl: state.url } });
    }
    return isProfileComplete;
  }

}
