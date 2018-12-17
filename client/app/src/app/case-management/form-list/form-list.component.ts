

import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { CaseManagementService } from '../_services/case-management.service';

@Component({
  selector: 'app-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.css']
})
export class FormListComponent implements OnInit {
  formList;
  @ViewChild('search') search: ElementRef;
  constructor(private caseManagementService: CaseManagementService) {
  }
  ngOnInit() {
    this.getFormList();
  }
  async getFormList() {
    try {
      this.formList = await this.caseManagementService.getFormList();
    } catch (error) {
      console.error(error);
    }
  }
}
