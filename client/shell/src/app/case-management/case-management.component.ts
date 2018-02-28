import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { ActivatedRoute } from '@angular/router';
import { CaseManagementService } from './_services/case-management.service';
import 'rxjs/add/operator/map';
@Component({
  selector: 'app-case-management',
  templateUrl: './case-management.component.html',
  styleUrls: ['./case-management.component.css']
})
export class CaseManagementComponent implements OnInit, AfterViewInit {
  notYetVisitedLocations;
  alreadyVistedLocations;
  result;
  isVisited = true;
  currentLocationId;
  parentPath = '';
  locationLevels = [
    "county",
    "subcounty",
    "zone",
    "school"
  ];
  currentLevelIndex = -1;

  @ViewChild('search') search: ElementRef;
  constructor(
    private caseManagementService: CaseManagementService,
    private route: ActivatedRoute
  ) {
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.currentLocationId = params['currentLocationId'] ? params['currentLocationId'] : 0;
      this.getMyLocations();
      this.parentPath += this.currentLevelIndex <= -1 ? '' : `${this.locationLevels[this.currentLevelIndex]}=${this.currentLocationId}&`;
      this.currentLevelIndex++
      this.locationLevels.length - 1 === this.currentLevelIndex ? this.parentPath = `'${this.parentPath.slice(0, -1)}'` : null;
    });
    this.getMyLocations();
  }

  ngAfterViewInit() {
    /**
     *The `(res.length < 1 || res.trim())` expression checks if the string entered in the searchbox is a series of whitespace or
     * a non-empty string after removing the whitespace.
     * If the length of the string is <1, no text has been entered and thus cannot be a series of whitespace.
     **/
    Observable.fromEvent(this.search.nativeElement, 'keyup')
      .debounceTime(500)
      .map(val => val['target'].value)
      .distinctUntilChanged()
      .subscribe(res => (res.length < 1 || res.trim()) && this.searchLocation(res.trim()));
  }
  async getMyLocations() {
    try {
      this.result = await this.caseManagementService.getMyLocationVisits(this.currentLocationId);
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
