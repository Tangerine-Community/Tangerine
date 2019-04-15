import { Component, OnInit } from '@angular/core';
import { CaseManagementService } from '../_services/case-management.service';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
@Component({
  selector: 'app-observations-by-location',
  templateUrl: './observations-by-location.component.html',
  styleUrls: ['./observations-by-location.component.css']
})
export class ObservationsByLocationComponent implements OnInit {
  observations = [];
  filterValuesForDates;
  locationId;
  columns;
  constructor(
    private caseManagementService: CaseManagementService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.locationId = params['locationId'];
      this.getObservations(this.locationId);
    });

  }
  async getObservations(locationId: string) {
    this.filterValuesForDates = await this.caseManagementService.getFilterDatesForAllFormResponsesByLocationId(locationId);
    this.observations = await this.caseManagementService.getResponsesByLocationId(locationId);
    this.columns = this.observations[0]['columns'];
  }

  async onSelectDate(event) {
    let dateParts = event.target.value;
    try {
      if (dateParts === '_') {
        dateParts = this.filterValuesForDates[0].value;
      }
      this.observations =
        await this.caseManagementService.getResponsesByLocationId(this.locationId, dateParts);
    } catch (error) {
      console.error(error);
    }
  }

}
