import {Component, OnInit} from '@angular/core';
import {TangyFormResponse} from "../../tangy-forms/tangy-form-response.class";
import {DashboardService} from "../_services/dashboard.service";
import {ClassUtils} from '../class-utils';
import {VariableService} from "../../shared/_services/variable.service";
import {StudentResult} from "../dashboard/dashboard.component";
import {ActivatedRoute} from "@angular/router";
import {BehaviorSubject, Subject, Subscription} from "rxjs";

@Component({
  selector: 'app-class-nav-bar',
  templateUrl: './class-nav-bar.component.html',
  styleUrls: ['./class-nav-bar.component.css']
})
export class ClassNavBarComponent implements OnInit {
  formList = [];
  selectedClass: any
  selectedClassSubscription: Subscription;
  studentRegistrationCurriculum = 'student-registration';
  classRegistrationParams = {
    curriculum: 'class-registration'
  };
  
  window: any;
  classUtils: ClassUtils = new ClassUtils();
  currentClassIndex
  currArray
  allStudentResults: StudentResult[];
  getValue: (variableName, response) => any;
  enabledClasses = [];
  enabledClassesSubscription: Subscription;

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
      let classIndex = params['classIndex'];
      let curriculumId = params['curriculumId'];
      // this.formList = window['T'].classDashboard.formList;
      this.enabledClassesSubscription = this.dashboardService.enabledClasses$.subscribe((enabledClasses) => {
        this.enabledClasses = enabledClasses
      })
      if (this.enabledClasses.length === 0) {
        this.enabledClasses = await this.dashboardService.getEnabledClasses();
      }
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
      if (classIndex) {
        await this.variableService.set('class-classIndex', classIndex);
        this.currentClassIndex = classIndex;
      } else {
        let classClassIndex = await this.variableService.get('class-classIndex')
        if (classClassIndex !== null) {
          const classIndex = parseInt(classClassIndex)
          if (!Number.isNaN(classIndex)) {
            this.currentClassIndex = classIndex;
          }
        } else {
          this.currentClassIndex = 0;
        }
      }
      
      let currentClass = this.enabledClasses[this.currentClassIndex]?.doc
      if (typeof currentClass === 'undefined') {
        // Maybe a class has been removed
        this.currentClassIndex = 0
        currentClass = this.enabledClasses[this.currentClassIndex]?.doc
      }
      this.selectedClass = currentClass;
      this.selectedClassSubscription = this.dashboardService.selectedClass$.subscribe((selectedClass) => {
        this.selectedClass = selectedClass
      })
      if (!curriculumId) {
        curriculumId = await this.variableService.get('class-curriculumId');
      }
      if (currentClass) {
        this.currArray = await this.dashboardService.populateCurrentCurriculums(currentClass);
      }

      if (typeof curriculumId === 'undefined' || curriculumId === null || curriculumId === '') {
        if (this.currArray && this.currArray.length === 0) {
          const curriculum = this.currArray[0];
          curriculumId = curriculum.name;
        }
      }
      await this.variableService.set('class-curriculumId', curriculumId);
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

  ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.enabledClassesSubscription) {
      this.enabledClassesSubscription.unsubscribe();
    }
    if (this.selectedClassSubscription) {
      this.selectedClassSubscription.unsubscribe();
    }
  }

}