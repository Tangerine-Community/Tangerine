import { Component, OnInit } from '@angular/core';
import {DashboardService} from "../_services/dashboard.service";
import {TangyFormsInfoService} from "../../tangy-forms/tangy-forms-info-service";
import {_TRANSLATE} from "../../../../../editor/src/app/shared/_services/translation-marker";
import {ClassFormService} from "../_services/class-form.service";
import {CookieService} from "ngx-cookie-service";

@Component({
  selector: 'app-class-config',
  templateUrl: './class-config.component.html',
  styleUrls: ['./class-config.component.css']
})
export class ClassConfigComponent implements OnInit {
  classes: any;

  constructor(    
    private dashboardService: DashboardService,
    private tangyFormsInfoService: TangyFormsInfoService,
    private classFormService: ClassFormService,
    private cookieService: CookieService
  ) { }

  async ngOnInit(): Promise<void> {
    (<any>window).Tangy = {};
    await this.classFormService.initialize();
    this.classes = await this.dashboardService.getMyClasses();
    console.log("Got classes")
  }

  async toggleClass(formId) {
    console.log("Toggling: " + formId)
    this.cookieService.deleteAll();
    await this.toggleDoc(formId)
  }

  async toggleDoc(id: string) {
    try {
      const doc = await this.classFormService.getResponse(id)
      const archived = doc.archive
      if (archived) {
        await this.dashboardService.enableDoc(id)
      } else {
        await this.dashboardService.archiveDoc(id)
      }
    } catch (error) {
      console.log(_TRANSLATE('Could not Toggle Form. Error: ' + error));
    }

  }
}
