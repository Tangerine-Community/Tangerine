import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TangyErrorHandler } from '../../../app/shared/_services/tangy-error-handler.service';
import { GroupsService } from '../services/groups.service';

@Component({
  selector: 'app-manage-location-list-levels',
  templateUrl: './manage-location-list-levels.component.html',
  styleUrls: ['./manage-location-list-levels.component.css']
})
export class ManageLocationListLevelsComponent implements OnInit {
  
  @Input() locationListFileName;

  groupId;
  locationsLevels:Array<any> = [];
  isFormShown = false;
  locationLabel;
  parentLevel;
  selectedLevel;
  locationListData;
  selected = 0;

  constructor(private http: HttpClient, 
              private route: ActivatedRoute,
              private errorHandler: TangyErrorHandler,
              private groupsService: GroupsService) { }

  async ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupId = params.groupId;
    });
    await this.loadLocationLevels()
  }

  async loadLocationLevels() {
    try {
      const data: any = await this.groupsService.getLocationList(this.groupId, this.locationListFileName);
      this.locationsLevels = data.locationsLevels;
      this.locationListData = data;
    } catch (error) {
      this.errorHandler.handleError('Could Not Load Location List Data');
    }
  }

  async addLocationLevel() {
    const index = this.locationListData.locationsLevels.indexOf(this.parentLevel);
    this.locationLabel = this.locationLabel.replace(/\W+/g, '_');
    const doesItemExist = this.locationListData.locationsLevels.indexOf(this.locationLabel.trim());
    if (doesItemExist >= 0) {
      this.errorHandler.handleError('Level with same name found');
    } else {
      this.locationListData.locationsLevels.splice(index + 1, 0, this.locationLabel.trim());
      try {
        const payload = {
          filePath: this.locationListFileName,
          groupId: this.groupId,
          fileContents: JSON.stringify(this.locationListData)
        };
        await this.http.post(`/editor/file/save`, payload).toPromise();
        await this.http.post(`/group-responses/index/${this.groupId}`, {
          index: {
            fields: [
              'type',
              'form.id',
              `location.${this.locationLabel.trim()}`
            ]
          }
        }).toPromise();
        this.locationLabel = '';
        this.parentLevel = '';

        this.loadLocationLevels();
      } catch (error) {
        this.errorHandler.handleError('Error Saving Location Lits File to disk');
      }
    }
  }

  setSelected(event: number) {
    this.selected = event
  }
}


