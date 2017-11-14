import 'rxjs/add/operator/toPromise';

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import PouchDB from 'pouchdb';

import { AuthenticationService } from '../../core/auth/_services/authentication.service';
import { UserService } from '../../core/auth/_services/user.service';
import { Loc } from '../../core/location.service';

function _window(): any {
    return window;
}

@Injectable()
export class CaseManagementService {
  userDB;
  loc: Loc;
  userService: UserService;
  myLocations = [];
  constructor(
    authenticationService: AuthenticationService,
    loc: Loc,
    userService: UserService,
    private http: Http
  ) {
    this.loc = loc;
    this.userService = userService;
    this.userDB = new PouchDB
      (authenticationService.getCurrentUserDBPath());
  }
  async getMyLocationList() {
    return await [];
  }
  async getMyLocationVisits() {

    const res = await fetch('/content/location-list.json');
    const locationList = await res.json();
    const userProfile = await this.userService.getUserProfile();

    // Calculate our locations by generating the path in the locationList object.
    let myLocations = {};
    const location = userProfile.inputs.find(input => input.name === 'location');
    let path = 'myLocations = locationList.locations';
    location.value.forEach(levelObject => path = `${path}["${levelObject.value}"].children`);
    eval(path);

    const locations = [];
    for (const locationId in myLocations) {
      locations.push({
        location: myLocations[locationId].label,
        visits: 0
      });
    }
    return locations;
  }

  async searchLocationByName() {

  }

  async getFormList() {
    return await this.http.get('/content/forms.json')
      .toPromise()
      .then(response => response.json()).catch(data => console.error(data));
  }
}


