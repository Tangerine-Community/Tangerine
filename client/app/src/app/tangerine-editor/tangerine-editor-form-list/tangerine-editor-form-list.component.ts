import { Component, OnInit } from '@angular/core';
import { CaseManagementService } from '../../case-management/_services/case-management.service';

@Component({
  selector: 'tangerine-editor-form-list',
  templateUrl: './tangerine-editor-form-list.component.html',
  styleUrls: ['./tangerine-editor-form-list.component.css']
})
export class TangerineEditorFormListComponent implements OnInit {

  formList;

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
