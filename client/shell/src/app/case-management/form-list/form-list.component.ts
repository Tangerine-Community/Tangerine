import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs/Rx';
import { CaseManagementService } from '../_services/case-management.service';

@Component({
  selector: 'app-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.css']
})
export class FormListComponent implements OnInit {
  formList;
  searchTextValue$;
  constructor(private caseManagementService: CaseManagementService) {
    this.searchTextValue$ = new Subject();
  }
  ngOnInit() {
    this.searchTextValue$.debounceTime(500).distinctUntilChanged().subscribe(searchText => {
      this.searchForm(searchText);
    });
    this.getFormList();
  }

  async getFormList() {
    try {
      this.formList = await this.caseManagementService.getFormList();
    } catch (error) {
      console.error(error);
    }
  }

  onSearchBoxKeup(searchText) {
    this.searchTextValue$.next(searchText);
  }
  async searchForm(formName) {
    const list = await this.caseManagementService.getFormList();
    this.formList = list.filter(data => {
      const title = data.title.toLowerCase();
      return title.includes(formName.toLowerCase());
    });
  }
}
