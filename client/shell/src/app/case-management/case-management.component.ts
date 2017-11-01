import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { CaseManagementService } from './_services/case-management.service';

@Component({
  selector: 'app-case-management',
  templateUrl: './case-management.component.html',
  styleUrls: ['./case-management.component.css']
})
export class CaseManagementComponent implements OnInit {
  notYetVisitedLocations;
  alreadyVistedLocations;
  result;
  isVisited = true;
  searchTextValue$;
  constructor(private caseManagementService: CaseManagementService) {
    this.searchTextValue$ = new Subject();
  }

  async ngOnInit() {
    this.searchTextValue$.debounceTime(500).distinctUntilChanged().subscribe(searchText => {
      this.searchLocation(searchText);
    });
    this.getMyLocations();
  }
  async getMyLocations() {
    try {
      this.result = await this.caseManagementService.getMyLocationVisits();
      this.notYetVisitedLocations = this.filterLocationsByVisitStatus(this.result, !this.isVisited);
      this.alreadyVistedLocations = this.filterLocationsByVisitStatus(this.result, this.isVisited);
    } catch (error) {
      console.error(error);
    }
  }
  filterLocationsByVisitStatus(data, isVisited) {
    return data.filter((item) => {
      return (isVisited && item.visits > 0) || (!isVisited && item.visits < 1);
    });
  }
  onSearchBoxKeup(searchText) {
    this.searchTextValue$.next(searchText);
  }
  searchLocation(locationName) {
    this.notYetVisitedLocations =
      this.filterRecordsBySearchTerm(this.filterLocationsByVisitStatus(this.result, !this.isVisited), locationName);
    this.alreadyVistedLocations =
      this.filterRecordsBySearchTerm(this.filterLocationsByVisitStatus(this.result, this.isVisited), locationName);
  }

  filterRecordsBySearchTerm(records, filterText) {
    if (Array.isArray(records)) {
      return records.filter(data => {
        const location = data.location.toLowerCase();
        return location.includes(filterText.toLowerCase());
      });
    } else {
      console.error('Could not load records');
    }
  }
}
