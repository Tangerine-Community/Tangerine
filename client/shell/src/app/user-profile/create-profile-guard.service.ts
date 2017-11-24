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
    let isProfileComplete = false;
    this.userDatabase = await this.userService.getUserDatabase();
    this.DB = new PouchDB(this.userDatabase);
    const results = await
      this.DB.query('tangy-form/formByFormId',
        { key: 'user-profile', include_docs: true });

    if (results.rows.length === 0) {
      isProfileComplete = false;
    } else {
      const response_Id = results.rows[0].doc['responseId'] ?
        results.rows[0].doc['responseId'] :
        null;
      if (response_Id) {
        const responseDoc = await this.DB.get(response_Id, { include_docs: true });
        isProfileComplete = !!responseDoc.complete;
      }
    }

    if (!isProfileComplete) {
      this.router.navigate(['/manage-user-profile'], { queryParams: { returnUrl: state.url } });
    }
    return isProfileComplete;
  }

}
