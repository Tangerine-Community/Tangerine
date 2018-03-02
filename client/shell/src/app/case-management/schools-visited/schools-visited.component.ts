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
    try {
      const result = await this.caseManagementService.getMyLocationVisits();
      const isVisited = true;
      this.schoolsVisitedThisMonth = this.filterLocationsByVisitStatus(result, isVisited);
    } catch (error) {
      console.error(error);
    }
  }

  filterLocationsByVisitStatus(data, isVisited) {
    return data.filter((item) => {
      return (isVisited && item.visits > 0) || (!isVisited && item.visits < 1);
    });
  }
}
