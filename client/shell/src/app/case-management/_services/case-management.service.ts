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
  async getMyLocationVisits(locationId?: string) {

    const res = await this.http.get('../content/location-list.json').toPromise();
    const locationList = res.json();
    const userProfile = await this.userService.getUserProfile();
    let parentPath = '';
    let isFinalLevel = false;
    // Calculate our locations by generating the path in the locationList object.
    let myLocations = locationList.locations;
    const location = findById(myLocations, locationId);
    if (locationId && (location['children'])) {
      myLocations = location['children'];
    }

    //Check if the first item in the loaction['children] has the propery children
    if (locationId && typeof location['children'][Object.keys(location['children'])[0]]['children'] === 'undefined') {
      isFinalLevel = true;
    }
    const locations = [];
    const visits = await this.getVisitsThisMonthByLocation(locationId);
    /**
     *  Check for ownProperty in myLocations
     * for ...in  iterate over all enumerable properties of the object
     * Also enumerates and those the object inherits from its constructor's prototype
     * You may get unexpected properties from the prototype chain
     */
    for (const locationId in myLocations) {
      if (myLocations.hasOwnProperty(locationId)) {
        locations.push({
          location: myLocations[locationId].label,
          visits: countUnique(visits, myLocations[locationId]['id'].toString()),
          id: myLocations[locationId]['id'],
          isFinalLevel,
          parentPath: parentPath.slice(0, -1)// Remove the trailing `&` from the string
        });
      }
    }
    return locations;
  }

  async getFormList() {
    const forms = [];
    const visits = await this.getResponsesByFormId();
    const formList = await this.http.get('../content/forms.json')
      .toPromise()
      .then(response => response.json()).catch(data => console.error(data));
    for (const form of formList) {
      forms.push({
        title: form['title'],
        count: countUnique(visits, form['id']),
        src: form['src'],
        id: form['id']
      });
    }


    return forms;
  }

  async getVisitsThisMonthByLocation(locationId?: string) {
    const options = { key: locationId ? locationId : '' }
    const results = await this.userDB.query('tangy-form/responsesThisMonthByLocationId');
    return results.rows;
  }

  async getResponsesByLocationId(locationId: string) {
    const results = await this.userDB.query('tangy-form/responsesByLocationId', { key: locationId, include_docs: true });
    return results.rows;
  }
  async getResponsesByFormId() {
    const results = await this.userDB.query('tangy-form/responsesByFormId');
    return results.rows;
  }
}

function countUnique(array, key) {
  let count = 0;
  array.forEach((item) => {
    count += item.key.toString() === key ? 1 : 0;
  });
  return count;
}

function findById(object, property) {
  //Early return
  if (object.id === property) {
    return object;
  }
  var result, p;
  for (p in object) {
    if (object.hasOwnProperty(p) && typeof object[p] === 'object') {
      result = findById(object[p], property);
      if (result) {
        return result;
      }
    }
  }
  return result;
}