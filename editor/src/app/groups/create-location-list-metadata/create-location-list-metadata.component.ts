import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TangyErrorHandler } from 'app/shared/_services/tangy-error-handler.service';
import { GroupsService } from '../services/groups.service';

@Component({
  selector: 'app-create-location-list-metadata',
  templateUrl: './create-location-list-metadata.component.html',
  styleUrls: ['./create-location-list-metadata.component.css']
})
export class CreateLocationListMetadataComponent implements OnInit {
  groupName;
  locationLevel;
  locationListFileName = 'location-list.json';
  isFormShown = false;
  form: any = { label: '', id: '', requiredField: null };
  locationListData: any;
  currentMetadata;
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
    try {
      let levelMetadata = this.currentMetadata;
      levelMetadata = levelMetadata.filter(item => item.label.trim() !== this.form.label.trim());
      this.form.id = this.groupsService.createUserReadableUUID(this.form.label);
      levelMetadata = [...levelMetadata, ...this.form];
      this.form = { label: '', id: '', requiredField: null };
      this.locationListData.metadata[this.locationLevel] = levelMetadata;
      this.currentMetadata = this.locationListData.metadata[this.locationLevel];
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
