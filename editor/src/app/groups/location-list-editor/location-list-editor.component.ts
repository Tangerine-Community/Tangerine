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
  showLocationForm = false;
  groupName = '';
  locationListFileName = 'location-list.json';
  isMoveLocationFormShown = false;
  parentItemsForMoveLocation;
  moveLocationParentLevelId;
  canMoveItem = false;
  isItemMarkedForUpdate = false;
  form: any = { label: '', id: '', metadata: {} };
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
    this.showLocationForm = false;
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
    this.isMoveLocationFormShown = false;
    this.showLocationForm = false;
  }

  async addItem(parentItem) {
    this.newItemId = this.groupsService.createUserReadableUUID(this.form.label);
    const newItem = { [this.newItemId]: { label: this.form.label, id: this.newItemId, metadata: this.form.metadata } };
    if (this.breadcrumbs.length === 1) {// Adding location item to root of location-list.locations
      this.locationList['locations'] = { ...this.locationList['locations'], ...newItem };
    } else {
      this.locationList = findAndAdd(this.locationList, parentItem.id, newItem);
    }
    await this.saveLocationListToDisk();
    await this.setLocationList(this.locationList);
    this.form = { label: '', id: '', metadata: {} };
    this.showLocationForm = false;
  }

  showEditForm(item) {
    this.showLocationForm = true;
    this.form = { ...this.form, ...item };
    this.isItemMarkedForUpdate = true;
  }
  async editItem() {
    const flatLocationList = Loc.flatten(this.locationList);
    const index = flatLocationList.locations.findIndex(location => location.id === this.form.id);
    flatLocationList.locations[index] = { ...flatLocationList.locations[index], ...this.form };
    this.locationList = Loc.unflatten(flatLocationList);
    await this.setLocationList(this.locationList);
    await this.saveLocationListToDisk();
    this.isItemMarkedForUpdate = false;
    this.hideLocationForm();
  }
  hideLocationForm() {
    this.form = { label: '', id: '', metadata: {} };
    this.showLocationForm = false;
    this.isItemMarkedForUpdate = false;
    this.isMoveLocationFormShown = false;
  }
  showMoveLocationForm() {
    this.isMoveLocationFormShown = true;
    this.showLocationForm = false;
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
    this.canMoveItem = !!itemId;
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
