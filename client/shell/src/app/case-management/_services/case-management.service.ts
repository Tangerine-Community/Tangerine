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
  async getMyLocationVisits(month: number, year: number) {

    const res = await this.http.get('../content/location-list.json').toPromise();
    const locationListObject = res.json();
    // Calculate our locations by generating the path in the locationList object.
    const locationList = locationListObject.locations;
    const myLocations = [];
    const locations = [];
    const results = await this.getVisitsByYearMonthLocationId();
    const visits = removeDuplicates(results, 'key'); // Remove duplicates due to multiple form responses in a given location in a day
    visits.forEach(visit => {
      const visitKey = visit.key.split('-');
      if (visitKey[2].toString() === month.toString() && visitKey[3].toString() === year.toString()) {
        const item = findById(locationList, visitKey[0]);
        locations.push({
          location: item.label,
          visits: countUnique(visits, item['id'].toString()),
          id: item['id']
        });
      }

    });
    return locations;
  }

  async getFilterDatesForAllFormResponses() {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const results = await this.getVisitsByYearMonthLocationId();
    const timeLapseFilter = [];
    const visits = removeDuplicates(results, 'key'); // Remove duplicates due to multiple form responses in a given location in a day
    visits.forEach(visit => {
      const visitKey = visit.key.split('-');
      timeLapseFilter.push({
        value: `${visitKey[2].toString()}-${visitKey[3].toString()}`,
        label: `${monthNames[visitKey[2].toString()]}, ${visitKey[3].toString()}`,
      });
    });
    return removeDuplicates(timeLapseFilter, 'value');
  }

  async getFormList() {
    const forms = [];
    const formList = await this.http.get('../content/forms.json')
      .toPromise()
      .then(response => response.json()).catch(data => console.error(data));
    for (const form of formList) {
      forms.push({
        title: form['title'],
        src: form['src'],
        id: form['id']
      });
    }
    return forms;
  }
  async getVisitsByYearMonthLocationId(locationId?: string) {
    const options = { key: locationId };
    const results = await this.userDB.query('tangy-form/responsesByYearMonthLocationId', options);
    return results.rows;
  }

  async getResponsesByLocationId(locationId: string) {
    const results = await this.userDB.query('tangy-form/responsesByLocationId', { key: locationId, include_docs: true });
    return results.rows;
  }
}
function removeDuplicates(array, property) {
  return array.filter((obj, pos, arr) => {
    return arr.map(mappedObject => mappedObject[property]).indexOf(obj[property]) === pos;
  });
}
function countUnique(array, key) {
  let count = 0;
  array.forEach((item) => {
    count += item.key.toString().startsWith(key) ? 1 : 0;
  });
  return count;
}

function findById(object, property) {
  // Early return
  if (object.id === property) {
    return object;
  }
  let result;
  for (const p in object) {
    if (object.hasOwnProperty(p) && typeof object[p] === 'object') {
      result = findById(object[p], property);
      if (result) {
        return result;
      }
    }
  }
  return result;
}
