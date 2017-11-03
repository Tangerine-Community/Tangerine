import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { CaseManagementService } from '../_services/case-management.service';
import 'rxjs/add/operator/map';
@Component({
  selector: 'app-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.css']
})
export class FormListComponent implements OnInit, AfterViewInit {
  formList;
  formName;
  @ViewChild('search') search: ElementRef;
  constructor(private caseManagementService: CaseManagementService) {
  }
  ngOnInit() {
    this.getFormList();
  }

  ngAfterViewInit() {
    Observable.fromEvent(this.search.nativeElement, 'keyup')
      .debounceTime(500)
      .map(val => val['target'].value)
      .distinctUntilChanged()
      .subscribe(res => this.searchForm(res));
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
