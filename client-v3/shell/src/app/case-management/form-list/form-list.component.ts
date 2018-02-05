import 'rxjs/add/operator/map';

import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { CaseManagementService } from '../_services/case-management.service';

@Component({
  selector: 'app-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.css']
})
export class FormListComponent implements OnInit, AfterViewInit {
  formList;
  @ViewChild('search') search: ElementRef;
  constructor(private caseManagementService: CaseManagementService) {
  }
  ngOnInit() {
    this.getFormList();
  }

  ngAfterViewInit() {
    /**
     *The `(res.length < 1 || res.trim())` expression checks if the string entered in the searchbox is a series of whitespace or
     * a non-empty string after removing the whitespace.
     * If the length of the string is <1, no text has been entered and thus cannot be a series of whitespace.
     **/
    Observable.fromEvent(this.search.nativeElement, 'keyup')
      .debounceTime(500)
      .map(val => val['target'].value.trim())
      .distinctUntilChanged()
      .subscribe(res => this.searchForm(res.trim()));
  }
  async getFormList() {
    try {
      this.formList = await this.caseManagementService.getFormList();
    } catch (error) {
      console.error(error);
    }
  }

  async searchForm(formName) {
    const list = await this.caseManagementService.getFormList();
    this.formList = list.filter(data => {
      const title = data.title.toLowerCase();
      return title.includes(formName.toLowerCase());
    });
  }
}
