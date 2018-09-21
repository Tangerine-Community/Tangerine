import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { TangyErrorHandler } from 'app/shared/_services/tangy-error-handler.service';

@Component({
  selector: 'app-location-list-editor',
  templateUrl: './location-list-editor.component.html',
  styleUrls: ['./location-list-editor.component.css']
})
export class LocationListEditorComponent implements OnInit {
  locationList: any;
  currentPath = [];
  currentLocation: any;
  locationChildren = [];
  breadcrumbs = [];
  locationsLevels;
  locationsLevelsLength;
  newItemLabel;
  newItemId;
  metaData: any = {};
  isFormShown = false;
  groupName = '';
  locationListFileName = 'location-list.json';


  constructor(private http: HttpClient, private route: ActivatedRoute, private errorHandler: TangyErrorHandler) { }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupName = params.groupName;
    });
    try {
      const data: any = await this.http.get(`/editor/${this.groupName}/content/${this.locationListFileName}`).toPromise();
      this.locationsLevels = data.locationsLevels;
      this.locationsLevelsLength = data.locationsLevels.length;
      await this.setLocationList(data);
    } catch (error) {
      this.errorHandler.handleError('Could Not Load Location List Data');
    }
  }

  async setLocationList(locationList) {
    this.locationList = locationList;
    this.openPath([]);
  }

  openPath(path) {
    this.currentPath = path;
    let currentChildren = [];
    let currentLocation = {
      id: 'root',
      label: 'root',
      children: this.locationList.locations
    };
    let breadcrumbs = [currentLocation];
    for (let fragment of this.currentPath) {
      currentLocation = currentLocation.children[fragment];
      breadcrumbs.push(currentLocation);
    }
    for (let prop in currentLocation.children) {
      currentChildren.push(currentLocation.children[prop]);
    }
    this.locationChildren = currentChildren;
    this.currentLocation = currentLocation;
    this.breadcrumbs = breadcrumbs;
  }

  onChildClick(id) {
    this.openPath([...this.currentPath, ...id]);
  }

  onClickBreadcrumb(id) {
    this.openPath(this.currentPath.slice(0, this.currentPath.indexOf(id) + 1));
  }

  async addItem(item) {
    this.newItemId = this.newItemLabel;
    const newItem = { [this.newItemId]: { label: this.newItemLabel, id: this.newItemId, ...this.metaData } };
    if (this.breadcrumbs.length === 1) {
      this.locationList['locations'] = { ...this.locationList['locations'], ...newItem };
    } else {
      this.locationList = findAndAdd(this.locationList, item.id, newItem);
    }
    await this.saveLocationListToDisk();
    await this.setLocationList(this.locationList);
    this.newItemId = '';
    this.newItemLabel = '';
    this.metaData = {};
    this.isFormShown = false;
  }
  async editItem(item) {
    const newItem = { label: this.newItemLabel };
    this.locationList = findAndEdit(this.locationList, item.id, newItem);
    await this.setLocationList(this.locationList);
  }
  async saveLocationListToDisk() {
    try {
      const payload = { filePath: this.locationListFileName, groupId: this.groupName, fileContents: JSON.stringify(this.locationList) };
      await this.http.post(`/editor/file/save`, payload).toPromise();
      this.errorHandler.handleError(`Successfully saved Location list for Group: ${this.groupName}`);
    } catch (error) {
      console.log(error);
      this.errorHandler.handleError('Error Saving Location Lits File to disk');
    }
  }
}
function findAndAdd(object, value, replaceValue) {
  for (let x in object) {
    if (object.hasOwnProperty(x)) {
      if (typeof object[x] === 'object') {
        findAndAdd(object[x], value, replaceValue);
      }
      if (object[x] === value) {
        object['children'] = { ...object['children'], ...replaceValue };
        break;
      }
    }
  }
  return object;
}
function findAndEdit(object, value, replaceValue) {
  for (let x in object) {

    if (object.hasOwnProperty(x)) {
      parent = object;
      if (typeof object[x] === 'object') {
        findAndEdit(object[x], value, replaceValue);
      }
      if (object[x] === value) {
        object.label = replaceValue.label;
        // object.children = objectCopy.children;
        break;
      }
    }
  }
  return object;
}
