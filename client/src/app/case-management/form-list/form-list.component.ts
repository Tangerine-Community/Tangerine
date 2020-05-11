import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';


import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';

import { CaseManagementService } from '../_services/case-management.service';

@Component({
  selector: 'app-form-list',
  templateUrl: './form-list.component.html',
  styleUrls: ['./form-list.component.css']
})
export class FormListComponent implements OnInit {
  formList;
  @ViewChild('search', {static: true}) search: ElementRef;
  constructor(
    private tangyFormsInfoService:TangyFormsInfoService
  ) {
  }
  ngOnInit() {
    this.getFormList();
  }
  async getFormList() {
    try {
      this.formList = (await this.tangyFormsInfoService.getFormsInfo()).filter(form => !form.archived && form.listed !== false);
    } catch (error) {
      console.error(error);
    }
  }
}
