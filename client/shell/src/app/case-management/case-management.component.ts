import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Rx';
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

  @ViewChild('search') search: ElementRef;
  constructor(private caseManagementService: CaseManagementService) {
  }

  async ngOnInit() {
    this.getMyLocations();
  }

  ngAfterViewInit() {
    Observable.fromEvent(this.search.nativeElement, 'keyup')
      .debounceTime(500)
      .map(val => val['target'].value)
      .distinctUntilChanged()
      .subscribe(res => this.searchLocation(res));
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
