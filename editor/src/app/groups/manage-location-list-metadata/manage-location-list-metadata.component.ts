import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TangyErrorHandler } from '../../shared/_services/tangy-error-handler.service';
import { GroupsService } from '../services/groups.service';
// import * as snakeCase from 'just-snake-case';
import snakeCase from '@queso/snake-case'
@Component({
  selector: 'app-manage-location-list-metadata',
  templateUrl: './manage-location-list-metadata.component.html',
  styleUrls: ['./manage-location-list-metadata.component.css']
})
export class ManageLocationListMetadataComponent implements OnInit {

  title = _TRANSLATE('Location List Metadata')
  breadcrumbs:Array<Breadcrumb> = []
 
  groupName;
  locationLevel;
  locationListFileName = 'location-list.json';
  isFormShown = false;
  defaultFormState = { label: '', id: '', requiredField: null, variableName: '' };
  form: any;
  locationListData: any;
  currentMetadata;
  isItemMarkedForUpdate = false;
  itemToUpdate;
  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private errorHandler: TangyErrorHandler,
    private groupsService: GroupsService) { }
  async ngOnInit() {

    this.form = this.defaultFormState;
    this.route.params.subscribe(params => {
      this.groupName = params.groupId;
      this.locationLevel = params.locationLevel;
      this.breadcrumbs = [
        <Breadcrumb>{
          label: _TRANSLATE('Location List'),
          url: 'location-list'
        },
        <Breadcrumb>{
          label: _TRANSLATE('Location List Metadata'),
          url: `location-list/manage-location-list-metadata/${params.locationLevel}`
        }
      ]
    });
    try {
      this.locationListData = await this.http.get(`/editor/${this.groupName}/content/${this.locationListFileName}`).toPromise();
      this.locationListData['metadata'] = this.locationListData.metadata || {};
      this.locationListData.metadata[this.locationLevel] = this.locationListData.metadata[this.locationLevel] || [];
      this.currentMetadata = this.locationListData.metadata[this.locationLevel];

    } catch (error) {
      this.errorHandler.handleError('Could Not Load Location List Data');
    }
  }

  toggleShowForm() {
    this.isFormShown = !this.isFormShown;
    this.form = {...this.defaultFormState};
  }
  async addMetadataItem() {

    let levelMetadata = this.currentMetadata;
    levelMetadata = levelMetadata.filter(item => item.label.trim() !== this.form.label.trim());
    const index = levelMetadata.findIndex(item => item.variableName === this.form.variableName)
    if (index < 0) {
      this.form.id = this.groupsService.generateLocationIDs(this.locationListData);
      this.form.variableName = createVariableName(this.form.variableName);
      levelMetadata = [...levelMetadata, this.form];
      this.form = this.defaultFormState;
      this.locationListData.metadata[this.locationLevel] = levelMetadata;
      this.currentMetadata = this.locationListData.metadata[this.locationLevel];
      this.isFormShown = false;
      await this.saveLocationList();
    } else {
      this.errorHandler.handleError("The variable name already Exists in the location list");
    }

  }

  onChangeVariableName(event) {
    this.form.variableName = createVariableName(event.target.value);
  }

  async deleteItem(item) {
    const proceedWithDeletion = confirm(`Delete ${item.label} ?`);
    if (proceedWithDeletion) {
      this.currentMetadata = this.currentMetadata.filter(metadata => metadata.id !== item.id);
      this.locationListData.metadata[this.locationLevel] = this.currentMetadata;
      await this.saveLocationList();
    }
  }

  showEditForm(item) {
    this.isFormShown = true;
    this.form = { ...this.form, ...item };
    this.isItemMarkedForUpdate = true;
    this.itemToUpdate = item;

  }

  async updateItem() {
    this.currentMetadata = this.currentMetadata.map(metadata => {
      if (metadata.id === this.itemToUpdate.id) {
        this.form.variableName = createVariableName(this.form.variableName);
        metadata = { ...metadata, ...this.form };
      }
      return metadata;
    });
    this.locationListData.metadata[this.locationLevel] = this.currentMetadata;
    this.isItemMarkedForUpdate = false;
    this.form = this.defaultFormState;;
    this.itemToUpdate = {};
    this.isFormShown = false;
    await this.saveLocationList();
  }

  async saveLocationList() {
    try {
      const payload = {
        filePath: this.locationListFileName,
        groupId: this.groupName,
        fileContents: JSON.stringify(this.locationListData)
      };
      await this.http.post(`/editor/file/save`, payload).toPromise();
      this.errorHandler.handleError(`Successfully saved Location list for Group: ${this.groupName}`);
    } catch (error) {
      this.errorHandler.handleError('Error Saving Location List File to disk');
    }
  }

}
/**
 * Removes all non alpha characters including numbers.
 * Uses just_snake_case package to generate a snake case string
 * Removes any trailing underscores
 * @param value string to be transformed into valid ID
 * @returns `string`
 */
function createVariableName(value) {
  return snakeCase(value.replace(/[0-9]/g, "_")).replace(/_+$/, "");
}