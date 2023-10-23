import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { GroupsService, LocationList } from '../services/groups.service';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';

@Component({
  selector: 'app-group-location-list-new',
  templateUrl: './group-location-list-new.component.html',
  styleUrls: ['./group-location-list-new.component.css']
})
export class GroupLocationListNewComponent implements OnInit {

  title = _TRANSLATE('New Location List')
  breadcrumbs:Array<Breadcrumb> = [
    <Breadcrumb>{
      label: _TRANSLATE('Location Lists'),
      url: `location-lists/new`
    }
  ]

  // Mat form field control type implied
  locationListTitle

  groupId:string
  generatedLocationId:string

  constructor(
    private groupsService: GroupsService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.groupId = params['groupId'];
      this.generatedLocationId = params['locationListId'];
    });
  }

  async onSubmit() {
    if (!this.locationListTitle) {
      alert(_TRANSLATE('Please provide a title and id for this location list.'))
      return
    }
    
    const locationList:LocationList = {
      id: this.generatedLocationId,
      name: this.locationListTitle,
      locationsLevels: [],
      locations: {}
    }
    try { 
      this.groupsService.createLocationList(this.groupId, locationList)
      window.location.hash = `#/groups/${this.groupId}/configure/location-lists/${this.generatedLocationId}`
    } catch (err) {
      alert("Failed to create new location list.")
    }
  }
}
