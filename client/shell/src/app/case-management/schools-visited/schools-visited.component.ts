import { Component, OnInit } from '@angular/core';
import { CaseManagementService } from '../_services/case-management.service';

@Component({
  selector: 'app-schools-visited',
  templateUrl: './schools-visited.component.html',
  styleUrls: ['./schools-visited.component.css']
})
export class SchoolsVisitedComponent implements OnInit {

  visits = [];
  filterValuesForDates;
  currentDate;
  monthNames;
  constructor(private caseManagementService: CaseManagementService) { }

  ngOnInit() {
    this.getMyLocations();

  }
  async getMyLocations() {
    this.currentDate = new Date();
    try {
      this.visits =
        await this.caseManagementService.getMyLocationVisits(this.currentDate.getMonth(), this.currentDate.getFullYear());
      this.filterValuesForDates = await this.caseManagementService.getFilterDatesForAllFormResponses();
    } catch (error) {
      console.error(error);
    }
  }
  async onSelectDate(event) {
    let dateParts = event.target.value;
    try {
      if (dateParts === '_') {
        dateParts = this.filterValuesForDates[0].value;
      }
      dateParts = dateParts.split('-');
      this.visits =
        await this.caseManagementService.getMyLocationVisits(parseInt(dateParts[0], 10), parseInt(dateParts[1], 10));
    } catch (error) {
      console.error(error);
    }
  }
}
