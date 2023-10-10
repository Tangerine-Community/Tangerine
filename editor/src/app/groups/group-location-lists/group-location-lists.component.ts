import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Breadcrumb } from 'src/app/shared/_components/breadcrumb/breadcrumb.component';
import { _TRANSLATE } from 'src/app/shared/_services/translation-marker';
import { TangyErrorHandler } from '../../shared/_services/tangy-error-handler.service';
import { GroupsService } from '../services/groups.service';
import { Loc } from 'tangy-form/util/loc.js';


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
  locationListsLength = 0
  groupId:string

  constructor(    
    private route: ActivatedRoute,
    private router: Router,
    private groupsService: GroupsService,
    private errorHandler: TangyErrorHandler
  ) { }

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      this.groupId = params['groupId']
      this.listLocations()
    })
  }

  async listLocations() {
    try {
      const data: any = await this.groupsService.getLocationLists(this.groupId);
      this.locationLists = data;
      this.locationListsLength = data.length;
    } catch (error) {
      this.errorHandler.handleError('Could Not Load Location List Data');
    }

    /*
    this.csvTemplates = csvTemplates.map(csvTemplate => { return {
      "_id": csvTemplate._id,
      "Template Title": csvTemplate.title,
      "Form": formsInfo.find(formInfo => formInfo.id === csvTemplate.formId)?.title,
      "Columns": csvTemplate.headers
    }})
    */
  }

  async createLocationList() {
    //const csvTemplate = await this.groupsService.createCsvTemplate(this.groupId)
    //this.router.navigate([csvTemplate._id], {relativeTo: this.route})
  }

  async onRowClick($event) {
    this.router.navigate([$event.id], {relativeTo: this.route})
  }

  async onRowEdit($event) {
    //this.router.navigate([$event._id], {relativeTo: this.route})
  }

  async onRowDelete($event) {
    //const status = await this.formsService.deleteCsvTemplate(this.groupId, $event._id)
    //this.listCsvTemplates()
  }

}
