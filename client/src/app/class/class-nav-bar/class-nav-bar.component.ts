import {Component, OnInit} from '@angular/core';
import {TangyFormResponse} from "../../tangy-forms/tangy-form-response.class";
import {DashboardService} from "../_services/dashboard.service";
import {ClassUtils} from '../class-utils';
import {VariableService} from "../../shared/_services/variable.service";
import {StudentResult} from "../dashboard/dashboard.component";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-class-nav-bar',
  templateUrl: './class-nav-bar.component.html',
  styleUrls: ['./class-nav-bar.component.css']
})
export class ClassNavBarComponent implements OnInit {
  formList = [];
  selectedClass: any
  studentRegistrationCurriculum = 'student-registration';
  classRegistrationParams = {
    curriculum: 'class-registration'
  };
  enabledClasses = [];
  window: any;
  classUtils: ClassUtils = new ClassUtils();
  currentClassIndex
  currArray
  allStudentResults: StudentResult[];
  getValue: (variableName, response) => any;

  constructor(
    private dashboardService: DashboardService,
    private variableService: VariableService,
    private route: ActivatedRoute
  ) {
  }

  async ngOnInit(): Promise<void> {
    this.window = window;
    // this.selectedClass = window['T'].classDashboard.selectedClass;
    this.route.queryParams.subscribe(async params => {
      // this.formList = window['T'].classDashboard.formList;
      this.enabledClasses = await this.dashboardService.getEnabledClasses();
      this.getValue = this.dashboardService.getValue
      for (const classDoc of this.enabledClasses) {
        const grade = this.getValue('grade', classDoc.doc)
        let klass = {
          id: classDoc.id,
          name: grade,
          curriculum: []
        }
        // find the options that are set to 'on'
        const classArray = await this.dashboardService.populateCurrentCurriculums(classDoc.doc);
        if (classArray) {
          this.currArray = classArray
          klass.curriculum = this.currArray
        }
      }

      let classClassIndex = await this.variableService.get('class-classIndex')
      if (classClassIndex !== null) {
        const classIndex = parseInt(classClassIndex)
        if (!Number.isNaN(classIndex)) {
          this.currentClassIndex = classIndex;
        }
      }
      let currentClass = this.enabledClasses[this.currentClassIndex]?.doc
      if (typeof currentClass === 'undefined') {
        // Maybe a class has been removed
        this.currentClassIndex = 0
        currentClass = this.enabledClasses[this.currentClassIndex]?.doc
      } else {
        this.selectedClass = currentClass;
      }
      // this.currArray = await this.dashboardService.populateCurrentCurriculums(currentClass);
      const curriculumId = await this.variableService.get('class-curriculumId');
      // curriculumId will be null when starting with a new instance of tangerine.
      if (curriculumId) {
        const curriculumFormHtml = await this.dashboardService.getCurriculaForms(curriculumId);
        const curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml);
        this.formList = await this.dashboardService.populateFormsMetadata(curriculumId, curriculumFormsList, currentClass);
      }
    })
  }

  getClassTitle(classResponse: TangyFormResponse) {
    const gradeInput = classResponse?.items[0].inputs.find(input => input.name === 'grade')
    return gradeInput?.value
  }

  // Triggered by dropdown selection in UI.
  async populateCurriculum(classIndex, curriculumId) {
    const currentClass = this.enabledClasses[classIndex];
    const currentClassId = currentClass.id;
    this.allStudentResults = await this.dashboardService.initDashboard(classIndex, currentClassId, curriculumId, true, this.enabledClasses);
  }

}
