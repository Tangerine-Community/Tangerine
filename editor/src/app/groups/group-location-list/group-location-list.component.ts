import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { Breadcrumb } from './../../shared/_components/breadcrumb/breadcrumb.component';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupsService } from '../services/groups.service';
import { TangyErrorHandler } from '../../shared/_services/tangy-error-handler.service';

@Component({
  selector: 'app-group-location-list',
  templateUrl: './group-location-list.component.html',
  styleUrls: ['./group-location-list.component.css']
})
export class GroupLocationListComponent implements OnInit {

  title = _TRANSLATE("Location Lists")
  groupId:string
  locationListFileName:string
  locationListId:string
  stopPolling = false
  ready = false

  breadcrumbs:Array<Breadcrumb> = [
    <Breadcrumb>{
      label: this.title,
      url: `location-lists`
    }
  ]

  constructor(
    private route: ActivatedRoute,
    private groupsService: GroupsService,
    private errorHandler: TangyErrorHandler
  ) {
    this.groupId = this.route.snapshot.paramMap.get('groupId');
    this.locationListId = this.route.snapshot.paramMap.get('locationListId');

  }

  async ngOnInit() {
    try {
      const data: any = await this.groupsService.getLocationLists(this.groupId);
      const locationListData = data.find(loc => loc.id == this.locationListId);
      this.locationListFileName = locationListData.path

      this.breadcrumbs = [
        ...this.breadcrumbs,
        <Breadcrumb>{
          label: locationListData.name,
          url: `location-lists/${locationListData.id}`
        }
      ]
      this.ready = true
    } catch (error) {
      this.errorHandler.handleError('Could Not Load Location List Data');
    }
  }

}
