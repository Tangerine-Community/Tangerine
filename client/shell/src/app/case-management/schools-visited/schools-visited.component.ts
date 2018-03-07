import { Component, OnInit } from '@angular/core';
import { CaseManagementService } from '../_services/case-management.service';

@Component({
  selector: 'app-schools-visited',
  templateUrl: './schools-visited.component.html',
  styleUrls: ['./schools-visited.component.css']
})
export class SchoolsVisitedComponent implements OnInit {

  schoolsVisitedThisMonth;
  constructor(private caseManagementService: CaseManagementService) { }

  ngOnInit() {
    this.getMyLocations();
  }
  async getMyLocations() {
    const currentDate = new Date();
    try {
      /**
       * getMonth() returns a number representing each month. It is zero indexed i.e. Jan is 0, Feb 1.
       * So we add 1 to get the month as stored in the DB
       */
      const result = await this.caseManagementService.getMyLocationVisits(currentDate.getMonth() + 1, currentDate.getFullYear());
      const isVisited = true;
      this.schoolsVisitedThisMonth = this.filterLocationsByVisitStatus(result, isVisited);
    } catch (error) {
      console.error(error);
    }
  }

  filterLocationsByVisitStatus(data, isVisited?) {
    return data.filter((item) => {
      return (isVisited && item.visits > 0) || (!isVisited && item.visits < 1);
    });
  }
}
