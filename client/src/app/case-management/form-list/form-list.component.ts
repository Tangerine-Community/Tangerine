import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { TangyFormService } from 'src/app/tangy-forms/tangy-form.service';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';

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
    private tangyFormsInfoService:TangyFormsInfoService,
    private tangyFormService:TangyFormService,
    private appConfigService:AppConfigService
  ) {
  }
  ngOnInit() {
    this.getFormList();
  }
  async getFormList() {
    try {
      this.formList = (await this.tangyFormsInfoService.getFormsInfo()).filter(form => !form.archived && form.listed !== false);
      const appConfig = await this.appConfigService.getAppConfig();
      for (let form of this.formList) {
        if (appConfig.strictOneResponsePerForm) {
          const docs = await this.tangyFormService.getResponsesByFormId(form.id, 1);
          if (docs && Array.isArray(docs) && docs.length > 0) {
            let doc = docs[0];
            form.route = `/resume/${doc._id}`;
            form.new = false;
            form.complete = doc.complete;
          } else {
            form.route = `/new/${form.id}`;
            form.new = true;
          }
        } else {
          form.route = `/new/${form.id}`;
          form.new = true;
        }
      }
    } catch (error) {
      console.error(error);
    }


  }
}
