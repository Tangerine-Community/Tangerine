import 'rxjs/add/operator/toPromise';

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import PouchDB from 'pouchdb';

import { AuthenticationService } from '../../core/auth/_services/authentication.service';

@Injectable()
export class CaseManagementService {
  userDB;
  myLocations = [];
  constructor(
    authenticationService: AuthenticationService,
    private http: Http
  ) {
    this.userDB = new PouchDB
      (authenticationService.getCurrentUserDBPath());
  }
  async getMyLocationList() {
    return await [];
  }
  async getMyLocationVisits() {
    this.myLocations = await this.getMyLocationList();
    return [
      {
        location: 'Kababarma',
        visits: 3
      },
      {
        location: 'Kabochony',
        visits: 5
      }, {
        location: 'Ngetmoi',
        visits: 0
      }, {
        location: 'Kaptorokwo',
        visits: 2
      }, {
        location: 'Kendo',
        visits: 0
      }, {
        location: 'Sesya',
        visits: 1
      }, {
        location: 'Kipkaech B D',
        visits: 2
      }, {
        location: 'Kasore',
        visits: 7
      }];
  }

  async searchLocationByName() {

  }

  async getFormList() {
    return await this.http.get('content/forms.json')
      .toPromise()
      .then(response => response.json()).catch(data => console.error(data));
  }
}

