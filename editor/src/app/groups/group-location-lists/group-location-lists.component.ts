import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { TangyErrorHandler } from '../../shared/_services/tangy-error-handler.service';
import { GroupsService, LocationList } from '../services/groups.service';

@Component({
  selector: 'app-group-location-lists',
  templateUrl: './group-location-lists.component.html',
  styleUrls: ['./group-location-lists.component.css']
})
export class GroupLocationListsComponent implements OnInit {

  title = _TRANSLATE("Location Lists")
  breadcrumbs:Array<Breadcrumb> = [
    <Breadcrumb>{
      label: _TRANSLATE('Location Lists'),
      url: `location-lists`
    }
  ]

  locationLists:Array<any> = []
  locationListTableData:Array<any> = []
  locationListsLength = 0
  groupId:string

  constructor(    
    private route: ActivatedRoute,
    private router: Router,
    private groupsService: GroupsService,
    private errorHandler: TangyErrorHandler
  ) { }

  async ngOnInit() {
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    this.loadLocationLists();
  }

  async loadLocationLists() {
    try {
      const data: any = await this.groupsService.getLocationLists(this.groupId);
      if (data) {
        this.locationLists = data;
        this.locationListTableData = data.map(location => { return {
          "id": location.id,
          "Name": location.name,
          "Levels": location.locationsLevels
        }})
        this.locationListsLength = this.locationLists.length;
      }
    } catch (error) {
      this.errorHandler.handleError('Failed to load Location List information for this group.');
    }
  }

  async createLocationList() {
    const locationListId = await this.groupsService.generateID();
    this.router.navigate(['new', locationListId], {relativeTo: this.route})
  }

  async onRowEdit($event) {
    const locationId = $event.id    
    this.router.navigate([locationId], { relativeTo: this.route })
  }

  async onRowDelete($event) {
    const locationId = $event.id
    const locationName = $event.Name

    if (locationId == "location-list") {
      var confirmationText = _TRANSLATE(`WARNING: Clearing the default location list will impact deploy devices. Are you sure you want to clear the default location list?`)
    } else {
      var confirmationText =  _TRANSLATE(`Are you sure you want to delete the location list: ${locationName}?`)
    }

    const confirmation = confirm(confirmationText)
    if (confirmation) {
      const locationList = new LocationList({id: locationId}) 
      await this.groupsService.deleteLocationList(this.groupId, locationList);
      await this.loadLocationLists()
    }
  }

}
