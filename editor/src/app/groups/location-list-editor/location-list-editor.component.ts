import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { TangyErrorHandler } from 'app/shared/_services/tangy-error-handler.service';
import { GroupsService } from '../services/groups.service';
import { Loc } from 'tangy-form/loc.js';

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
  levelHasMetadata = false;
  locationsLevels;
  locationsLevelsLength;
  newItemLabel;
  newItemId;
  metadata: any = {};
  isAddLocationItemFormShown = false;
  groupName = '';
  locationListFileName = 'location-list.json';
  isMoveLocationFormShown = false;
  parentItemsForMoveLocation;
  moveLocationParentLevelId;
  canMoveItem = false;
  @ViewChild('container') container: ElementRef;
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private errorHandler: TangyErrorHandler,
    private groupsService: GroupsService
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupName = params.groupName;
    });
    try {
      const data: any = await this.http.get(`/editor/${this.groupName}/content/${this.locationListFileName}`).toPromise();
      const flatLocationList = Loc.flatten(data);
      // TODO Why do we need zoneLevelLocations???
      const zoneLevelLocations = flatLocationList.locations.filter(location => location.level === 'zone');
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
    this.isAddLocationItemFormShown = false;
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
    this.levelHasMetadata = this.locationList.metadata
      && typeof this.locationList.metadata[this.locationsLevels[breadcrumbs.length - 1]] !== 'undefined'
      ? true
      : false;

  }

  onChildClick(id) {
    this.openPath([...this.currentPath, ...id]);
    this.updateMoveLocationForm();
  }

  onClickBreadcrumb(id) {
    this.openPath(this.currentPath.slice(0, this.currentPath.indexOf(id) + 1));
    this.updateMoveLocationForm();
  }

  async addItem(parentItem) {
    this.newItemId = this.groupsService.createUserReadableUUID(this.newItemLabel);
    const newItem = { [this.newItemId]: { label: this.newItemLabel, id: this.newItemId, ...this.metadata } };
    if (this.breadcrumbs.length === 1) {// Adding location item to root of location-list.locations
      this.locationList['locations'] = { ...this.locationList['locations'], ...newItem };
    } else {
      this.locationList = findAndAdd(this.locationList, parentItem.id, newItem);
    }
    await this.saveLocationListToDisk();
    await this.setLocationList(this.locationList);
    this.newItemId = '';
    this.newItemLabel = '';
    this.metadata = {};
    this.isAddLocationItemFormShown = false;
  }
  async editItem(item) {
    const newItem = { label: this.newItemLabel, ...this.metadata };
    this.locationList = findAndEdit(this.locationList, item.id, newItem);
    await this.setLocationList(this.locationList);
  }

  showMoveLocationForm() {
    this.isMoveLocationFormShown = true;
  }
  updateMoveLocationForm() {
    const refineToLevel = [...this.locationsLevels].slice(0, this.breadcrumbs.length - 2);
    this.container.nativeElement.innerHTML = `
      <tangy-location show-levels="${refineToLevel.join(',')}" 
        location-src="/editor/${this.groupName}/content/${this.locationListFileName}">
    `;
    this.container.nativeElement.querySelector('tangy-location').
      addEventListener('change', event => this.onTangyLocationChange(event.target.value));
  }
  onTangyLocationChange(value) {
    const itemId = value[this.breadcrumbs.length - 3]['value'];
    this.canMoveItem = itemId ? true : false;
    this.moveLocationParentLevelId = this.canMoveItem ? itemId : '';
  }

  onSubmitMoveItem() {
    this.moveItem(this.breadcrumbs[this.breadcrumbs.length - 1]);
  }
  async moveItem(item) {
    const locationObject = findAndDeleteChild(this.locationList.locations, this.breadcrumbs[this.breadcrumbs.length - 2]['id'], item.id);
    this.locationList.locations = findAndAdd(locationObject, this.moveLocationParentLevelId, { [item.id]: { ...item } });
    await this.saveLocationListToDisk();
    await this.setLocationList(this.locationList);
    this.isMoveLocationFormShown = false;
    this.parentItemsForMoveLocation = null;
  }
  async saveLocationListToDisk() {
    try {
      const payload = { filePath: this.locationListFileName, groupId: this.groupName, fileContents: JSON.stringify(this.locationList) };
      await this.http.post(`/editor/file/save`, payload).toPromise();
      this.errorHandler.handleError(`Successfully saved Location list for Group: ${this.groupName}`);
    } catch (error) {
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
function findAndDeleteChild(object, parentId, childId) {
  for (let x in object) {
    if (object.hasOwnProperty(x)) {
      if (typeof object[x] === 'object') {
        findAndDeleteChild(object[x], parentId, childId);
      }
      if (object[x] === parentId) {
        delete object['children'][childId];
        break;
      }
    }
  }
  return object;
}
function findAndEdit(object, value, replaceValue) {
  for (let x in object) {

    if (object.hasOwnProperty(x)) {
      if (typeof object[x] === 'object') {
        findAndEdit(object[x], value, replaceValue);
      }
      if (object[x] === value) {
        object.label = replaceValue.label;
        break;
      }
    }
  }
  return object;
}

function findChildren(obj, key) {
  return key.split('.').reduce((result, i) => {
    return result[i];
  }, obj);
}
