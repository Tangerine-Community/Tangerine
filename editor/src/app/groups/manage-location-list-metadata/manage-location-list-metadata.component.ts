import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TangyErrorHandler } from 'app/shared/_services/tangy-error-handler.service';
import { GroupsService } from '../services/groups.service';

@Component({
  selector: 'app-manage-location-list-metadata',
  templateUrl: './manage-location-list-metadata.component.html',
  styleUrls: ['./manage-location-list-metadata.component.css']
})
export class ManageLocationListMetadataComponent implements OnInit {
  groupName;
  locationLevel;
  locationListFileName = 'location-list.json';
  isFormShown = false;
  form: any = { label: '', id: '', requiredField: null };
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
    this.route.params.subscribe(params => {
      this.groupName = params.groupName;
      this.locationLevel = params.locationLevel;
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
  async addMetadataItem() {

    let levelMetadata = this.currentMetadata;
    levelMetadata = levelMetadata.filter(item => item.label.trim() !== this.form.label.trim());
    this.form.id = this.groupsService.generateLocationIDs(this.locationListData);
    levelMetadata = [...levelMetadata, ...this.form];
    this.form = { label: '', id: '', requiredField: null };
    this.locationListData.metadata[this.locationLevel] = levelMetadata;
    this.currentMetadata = this.locationListData.metadata[this.locationLevel];
    this.isFormShown = false;
    await this.saveLocationList();

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
        metadata = { ...metadata, ...this.form };
      }
      return metadata;
    });
    this.locationListData.metadata[this.locationLevel] = this.currentMetadata;
    this.isItemMarkedForUpdate = false;
    this.form = { label: '', id: '', requiredField: null };
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
