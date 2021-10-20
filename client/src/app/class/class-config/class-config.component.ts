import { Component, OnInit } from '@angular/core';
import {DashboardService} from "../_services/dashboard.service";
import {TangyFormsInfoService} from "../../tangy-forms/tangy-forms-info-service";
import {_TRANSLATE} from "../../../../../editor/src/app/shared/_services/translation-marker";
import {ClassFormService} from "../_services/class-form.service";
import {VariableService} from "../../shared/_services/variable.service";
import { TangyFormResponse } from 'src/app/tangy-forms/tangy-form-response.class';

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
    private variableService: VariableService
  ) { }

  async ngOnInit(): Promise<void> {
    (<any>window).Tangy = {};
    await this.classFormService.initialize();
    this.classes = await this.dashboardService.getMyClasses();
    console.log("Got classes")
  }

  async toggleClass(id) {
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
      await this.variableService.set('class-classIndex', null);
      await this.variableService.set('class-currentClassId', null);
      await this.variableService.set('class-curriculumId', null);
      await this.variableService.set('class-currentItemId', null);
  }

  getClassTitle(classResponse:TangyFormResponse) {
    const gradeInput = classResponse.items[0].inputs.find(input => input.name === 'grade')
    return gradeInput.value
  }
  
}
