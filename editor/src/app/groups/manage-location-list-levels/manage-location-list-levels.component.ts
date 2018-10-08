import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TangyErrorHandler } from 'app/shared/_services/tangy-error-handler.service';
import { v4 as uuid } from 'uuid';
import { WindowRef } from '../../core/window-ref.service';
@Component({
  selector: 'app-manage-location-list-levels',
  templateUrl: './manage-location-list-levels.component.html',
  styleUrls: ['./manage-location-list-levels.component.css']
})
export class ManageLocationListLevelsComponent implements OnInit {
  groupName;
  locationListFileName = 'location-list.json';
  locationsLevels;
  isFormShown = false;
  locationLabel;
  parentLevel;
  locationListData;
  constructor(private http: HttpClient, private window: WindowRef, private route: ActivatedRoute, private errorHandler: TangyErrorHandler) { }


  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupName = params.groupName;
    });
    try {
      const data: any = await this.http.get(`/editor/${this.groupName}/content/${this.locationListFileName}`).toPromise();
      this.locationsLevels = data.locationsLevels;
      this.locationListData = data;
    } catch (error) {
      this.errorHandler.handleError('Could Not Load Location List Data');
    }
  }

  async addLocationLevel() {
    const index = this.locationListData.locationsLevels.indexOf(this.parentLevel);
    const doesItemExist = this.locationListData.locationsLevels.indexOf(this.locationLabel.trim());
    if (doesItemExist >= 0) {
      this.errorHandler.handleError('Level with same name found');
    } else {
      this.locationListData.locationsLevels.splice(index + 1, 0, this.locationLabel.trim());
      try {
        const payload = {
          filePath: this.locationListFileName,
          groupId: this.groupName,
          fileContents: JSON.stringify(this.locationListData)
        };
        await this.http.post(`/editor/file/save`, payload).toPromise();
        this.errorHandler.handleError(`Successfully saved Location list for Group: ${this.groupName}`);
        this.locationLabel = '';
        this.parentLevel = '';
        this.window.nativeWindow.location.reload()
      } catch (error) {
        this.errorHandler.handleError('Error Saving Location Lits File to disk');
      }
    }


  }
}


