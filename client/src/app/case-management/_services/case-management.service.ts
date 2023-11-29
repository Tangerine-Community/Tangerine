import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../shared/_services/user.service';
import { AppConfigService } from '../../shared/_services/app-config.service';

function _window(): any {
  return window;
}

@Injectable()
export class CaseManagementService {

  monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private appConfigService: AppConfigService
  ) {
  }
  async getMyLocationVisits(month: number, year: number) {
    const res = await this.appConfigService.getLocationList();
    const allLocations:any = Object.assign({}, res);
    // Calculate our locations by generating the path in the locationList object.
    const locationList = allLocations.locations;
    const locations = [];
    const results = await this.getVisitsByYearMonthLocationId();
    const visits = removeDuplicates(results, 'key'); // Remove duplicates due to multiple form responses in a given location in a day
    visits.forEach(visit => {
      if (visit.value.month === month && visit.value.year === year) {
        let item = findById(locationList, visit.value.locationId);
        if (!item) {
          locations.push({
            location: visit.value.locationId,
            visits: countUnique(visits, visit.value.locationId),
            id: visit.value.locationId
          })
        } else {
          locations.push({
            location: item.label,
            visits: countUnique(visits, item['id'].toString()),
            id: item['id']
          });
        }
      }

    });
    return removeDuplicates(locations, 'id');
  }

  async getFilterDatesForAllFormResponses() {
    const results = await this.getVisitsByYearMonthLocationId();
    const timeLapseFilter = [];
    const visits = removeDuplicates(results, 'key'); // Remove duplicates due to multiple form responses in a given location in a day
    visits.forEach(visit => {
      timeLapseFilter.push({
        value: `${visit.value.month.toString()}-${visit.value.year.toString()}`,
        label: `${this.monthNames[visit.value.month.toString()]}, ${visit.value.year.toString()}`,
      });
    });
    return removeDuplicates(timeLapseFilter, 'value');
  }

  async  getFilterDatesForAllFormResponsesByLocationId(locationId: string) {
    const userDb = await this.userService.getUserDatabase()
    const result = await userDb.query('tangy-form/responsesByLocationId', { key: locationId, include_docs: true });
    const timeLapseFilter = [];
    result.rows.forEach(observation => {
      const date = new Date(observation.doc.startUnixtime);
      timeLapseFilter.push({
        value: `${date.getMonth()}-${date.getFullYear()}`,
        label: `${this.monthNames[date.getMonth()]}-${date.getFullYear()}`
      });
    });
    return removeDuplicates(timeLapseFilter, 'value');
  }

  async getFormList() {
    return <Array<FormInfo>>await this.http.get('./assets/forms.json')
      .toPromise()
  }
  async getVisitsByYearMonthLocationId(locationId?: string, include_docs?: boolean) {
    const options = { key: locationId, include_docs };
    const userDb = await this.userService.getUserDatabase()
    const result = await userDb.query('tangy-form/responsesByYearMonthLocationId', options);
    return result.rows;
  }

  async getResponsesByLocationId(locationId: string, period?: string) {
    const userDb = await this.userService.getUserDatabase()
    const result = await userDb.query('tangy-form/responsesByLocationId', { key: locationId, include_docs: true });
    const currentDate: Date = new Date();
    const monthYear = period ? period : `${currentDate.getMonth()}-${currentDate.getFullYear()}`;
    const monthYearParts = monthYear.split('-');
    result.rows = result.rows.filter(observation => {
      const formStartDate = new Date(observation.doc.startUnixtime);
      return formStartDate.getMonth().toString() === monthYearParts[0] && formStartDate.getFullYear().toString() === monthYearParts[1];
    });
    const data = await this.transformResultSet(result.rows);
    return data;
  }
  async transformResultSet(result) {
    const appConfig = await this.appConfigService.getAppConfig();
    const columnsToShow = appConfig.columnsOnVisitsTab;
    const formList = await this.getFormList();

    const observations = result.map(async (observation) => {
      let columns = await this.getDataForColumns(observation.doc['items'], columnsToShow);
      columns = columns.filter(x => x !== undefined);
      const index = formList.findIndex(c => c.id === observation.doc.form['id']);
      let formTitle = ''
      if (index !== -1) {
        formTitle = formList[index]['title']
      } else if (observation.doc.form.title) {
        formTitle = observation.doc.form.title
      } else {
        formTitle = observation.doc.form.id
      }
      return {
        formTitle,
        startDatetime: observation.doc.startUnixtime,
        complete: observation.doc.complete,
        formIndex: index,
        _id: observation.doc._id,
        columns
      };
    });
    return Promise.all(observations);
  }

  async getDataForColumns(array, columns) {
    return columns.map(column => {
      const data = array.map(el => {
        return el.inputs.find(e => e.name === column);
      }).find(x => x);
      return ({
        name: data ? data.name : column,
        value: data ? data.value : ''
      });

    });
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
