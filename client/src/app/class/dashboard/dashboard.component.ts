import {UserService} from 'src/app/shared/_services/user.service';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DashboardService} from '../_services/dashboard.service';
import {PageEvent} from '@angular/material/paginator';
import {ClassFormService} from '../_services/class-form.service';
import {ActivatedRoute, Router} from '@angular/router';
import {_TRANSLATE} from '../../shared/translation-marker';
import {ClassUtils} from '../class-utils';
import {ClassGroupingReport} from '../reports/student-grouping-report/class-grouping-report';
import {TangyFormService} from '../../tangy-forms/tangy-form.service';
import {TangyFormsInfoService} from 'src/app/tangy-forms/tangy-forms-info-service';
import {VariableService} from "../../shared/_services/variable.service";
import {TangyFormResponse} from 'src/app/tangy-forms/tangy-form-response.class';
import {AppConfigService} from "../../shared/_services/app-config.service";
import {DateTime} from 'luxon';


export interface StudentResult {
  id: string;
  name: string;
  forms: any;
}
export interface StudentResponse {
  id: string;
  formId: string;
  columns: any;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  classes: any[]
  students: any[]
  enabledClasses; // filter out classes that have the 'archive' property.
  currentClassId; currentClassIndex;
  currentItemId; curriculumId;
  selectedClass; selectedCurriculum;

  curriculumFormsList;  // list of all curriculum forms
  curriculumForms;  // a subset of curriculumFormsList
  studentsResponses: any[];
  allStudentResults: StudentResult[];
  formColumns: string[] = [];
  formIds: string[] = [];
  formList: any[] = []; // used for the Dashboard user interface - creates Class grouping list
  formColumnsDS;

  // length = 10;
  pageLength = 10;
  pageSize = 5;
  pageIndex = 0;
  pageStart = 0;
  pageSizeOptions: number[] = [5, 10, 15, 100];
  reportsMenu;
  groupingMenu;
  studentRegistrationCurriculum = 'student-registration';
  classRegistrationParams = {
    curriculum: 'class-registration'
  };
  isLoading;

  pageEvent: PageEvent;
  curriculum; // object that contains name and value of curriculum.
  currArray: any[]; // array of curriculums in a class.
  classUtils: ClassUtils;
  classGroupReport: ClassGroupingReport;
  displayClassGroupReport = false;
  feedbackViewInited = false;
  useAttendanceFeature = false
  showScoreList: boolean
  showSummary: boolean
  window:any;
  
  getValue: (variableName, response) => any;
  @ViewChild('container', {static: true}) container: ElementRef;

    constructor(
        // private http: HttpClient,
        private dashboardService: DashboardService,
        // private userService: UserService,
        private router: Router,
        private classFormService: ClassFormService,
        // private tangyFormService: TangyFormService,
        // private tangyFormsInfoService: TangyFormsInfoService,
        private variableService: VariableService,
        private appConfigService: AppConfigService,
        private route: ActivatedRoute,
        private http: HttpClient
    ) {
    }

  

  async ngOnInit() {
    (<any>window).Tangy = {}
    this.window = window
    const appConfig = await this.appConfigService.getAppConfig()
    this.useAttendanceFeature = appConfig.useAttendanceFeature
    await this.classFormService.initialize();
    this.enabledClasses = await this.dashboardService.getEnabledClasses();
    this.getValue = this.dashboardService.getValue
    // const enabledClasses = this.classes.map(klass => {
    //   if ((klass.doc.items[0].inputs.length > 0) && (!klass.doc.archive)) {
    //     return klass
    //   }
    // });
    // this.enabledClasses = enabledClasses.filter(item => item).sort((a, b) => (a.doc.tangerineModifiedOn > b.doc.tangerineModifiedOn) ? 1 : -1)
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
    let classIndex, curriculumId
    
    this.route.queryParams.subscribe(async params => {
      classIndex = params['classIndex'];
      curriculumId = params['curriculumId'];
      if (typeof classIndex !== 'undefined') {
        // going to init some vars
        const currentClass = this.enabledClasses[classIndex];
        const currentClassId = currentClass.id;
        this.allStudentResults = await this.dashboardService.initDashboard(classIndex, currentClassId, curriculumId, true, this.enabledClasses);
      } else {
        this.allStudentResults = await this.dashboardService.initDashboard(null, null, null, null, this.enabledClasses);
      }

      this.classUtils = new ClassUtils();
      // resetVars = this.useAttendanceFeature ? true : resetVars
      // if (this.useAttendanceFeature) {
      //   await this.getAttendanceList()
      // } else {
      this.selectedClass = window['T'].classDashboard.selectedClass
      this.formList = window["T"].classDashboard.formList
      // this.enabledClasses = window['T'].classDashboard.enabledClasses;

      curriculumId = curriculumId? curriculumId: await this.variableService.get('class-curriculumId');
      this.selectedCurriculum = this.currArray?.find(x => x.name === curriculumId);
      this.currentItemId = await this.variableService.get('class-currentItemId');
    })
  }

  private async populateFeedback(curriculumId) {
    const subtest = this.curriculumFormsList.filter(obj => {
      return obj.id === this.currentItemId;
    });
    const item = subtest[0];
    const results = await this.getResultsByClass(this.currentClassId, curriculumId, this.curriculumFormsList, item);
    this.classGroupReport = await this.dashboardService.getClassGroupReport(item, this.currentClassId, curriculumId, results);
    if (this.classGroupReport) {
      if (this.classGroupReport.studentsAssessed && this.classGroupReport.classSize) {
        const percentComplete = this.classGroupReport.studentsAssessed / this.classGroupReport.classSize;
        if (percentComplete && percentComplete >= .8) {
          this.displayClassGroupReport = true;
        } else {
          this.displayClassGroupReport = false;
        }
      }

    }
  }

  // Triggered by dropdown selection in UI.
  async populateCurriculum (classIndex, curriculumId) {
    const currentClass = this.enabledClasses[classIndex];
    const currentClassId = currentClass.id;
    await this.dashboardService.initDashboard(classIndex, currentClassId, curriculumId, true, this.enabledClasses);
  }

  selectReport(reportId) {
    console.log('reportId: ' + reportId);
  }

  /** Populate the querystring with the form info. */
  async selectCheckbox(column, itemId) {
    // let el = this.selection.select(row);
    // this.selection.toggle(column)
    const formsArray = Object.values(column.forms);
    const selectedForm = formsArray.find(input => (input['formId'] === itemId) ? true : false);
    const studentId = column.id;
    const classId = column.classId;
    const selectedFormId = selectedForm['formId'];
    const curriculum = selectedForm['curriculum'];
    const src = selectedForm['src'];
    const title = selectedForm['title'];
    let responseId = null;
    const curriculumResponse = await this.dashboardService.getCurriculumResponse(classId, curriculum, studentId)
    if (curriculumResponse) {
      responseId = curriculumResponse._id
    }
    this.router.navigate(['class-form'], { queryParams:
        { formId: selectedFormId,
          curriculum: curriculum,
          studentId: studentId,
          classId: classId,
          itemId: itemId,
          src: src,
          title: title,
          responseId: responseId }
    });
  }

  /** Populate the querystring with the form info. */
  selectCheckboxResult(column, itemId, event) {
    // let el = this.selection.select(column);
    event.currentTarget.checked = true;
    // this.selection.toggle(column)
    const formsArray = Object.values(column.forms);
    const selectedForm = formsArray.find(input => (input['formId'] === itemId) ? true : false);
    const studentId = column.id;
    const classId = column.classId;
    const selectedFormId = selectedForm['formId'];
    const curriculum = selectedForm['curriculum'];
    const src = selectedForm['src'];
    const title = selectedForm['title'];
    const responseId = selectedForm['response']['_id'];
    this.router.navigate(['class-form'], { queryParams:
        { formId: selectedFormId, curriculum: curriculum, studentId: studentId,
          classId: classId, itemId: selectedFormId, src: src, title:
          title, responseId: responseId }
    });
  }

  /** Navigate to the student registration form */
  selectStudentName(column) {
    const formsArray = Object.values(column.forms);
    const studentId = column.id;
    const classId = column.classId;
    this.router.navigate(['class-form'], { queryParams:
        { curriculum: 'student-registration', studentId: studentId, classId: classId, responseId: studentId, viewRecord: true }
    });
  }

  async archiveStudent(column) {
    const studentId = column.id;
    console.log('Archiving student:' + studentId);
    const deleteConfirmed = confirm(_TRANSLATE('Delete this student?'));
    if (deleteConfirmed) {
      try {
        const responses = await this.classFormService.getResponsesByStudentId(studentId);
        for (const response of responses as any[] ) {
          response.doc.archive = true;
          const lastModified = Date.now();
          response.doc.lastModified = lastModified;
          const archiveResult = await this.classFormService.saveResponse(response.doc);
          console.log('archiveResult: ' + archiveResult);
        }
        const result = await this.dashboardService.archiveDoc(studentId);
        console.log('result: ' + result);
      } catch (e) {
        console.log('Error deleting student: ' + e);
        return false;
      }
    }
  }

  // /**
  //  * Fetch ./assets/${curriculum}/form.html, attach to the container, select all tangy-form-item objects
  //  * and push into a string array, limited by pageIndex and pageSize
  //  * @param curriculum
  //  * @param pageIndex
  //  * @param pageSize
  //  * @returns {Promise<any[]>}
  //  */
  // async getCurriculaForms(curriculum, pageIndex, pageSize) {
  //   try {
  //     let selectedCurriculumForms, start, end, curriculumForms = [];
  //     const i = 1;
  //     if (pageIndex === 0) {
  //       start = 0;
  //       end = pageSize;
  //     } else {
  //       this.pageLength = Math.max(this.pageLength, 0);
  //       start = ((pageIndex * pageSize) > this.pageLength) ?
  //         (Math.ceil(this.pageLength / pageSize) - 1) * pageSize :
  //         pageIndex * pageSize;
  //       this.pageStart = start;
  //       end = Math.min(start + pageSize, this.pageLength);
  //       console.log( start + 1 + ' - ' + end + '  of  ' + this.pageLength);
  //     }
  //
  //     // this only needs to happen once.
  //     const curriculumFormHtml = await this.dashboardService.getCurriculaForms(curriculum);
  //     const container = this.container.nativeElement;
  //     container.innerHTML = curriculumFormHtml;
  //     const formEl = container.querySelectorAll('tangy-form-item');
  //     const output = '';
  //     for (const el of formEl) {
  //       const attrs = el.attributes;
  //       const obj = {};
  //       for (let i = attrs.length - 1; i >= 0; i--) {
  //         // output = attrs[i].name + "->" + attrs[i].value;
  //         obj[attrs[i].name] = attrs[i].value;
  //         // console.log("this.formEl:" + output )
  //       }
  //       curriculumForms.push(obj);
  //     }
  //     this.curriculumFormsList = curriculumForms;
  //
  //     this.formList = [];
  //     let currentClassId;
  //     const currentClass = this.enabledClasses[this.currentClassIndex];
  //     if (typeof currentClass !== 'undefined') {
  //       currentClassId = currentClass.id;
  //     }
  //     for (const form of this.curriculumFormsList) {
  //       const formEl = {
  //         'title': form.title,
  //         'id': form.id,
  //         'classId': currentClassId,
  //         'curriculumId': curriculum
  //       };
  //       this.formList.push(formEl);
  //     }
  //
  //     // this.length = this.curriculumFormsList.length
  //     this.pageLength = this.curriculumFormsList.length;
  //     selectedCurriculumForms  = curriculumForms.slice(start, end);
  //     return selectedCurriculumForms;
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }

  async getMyStudents(selectedClass: any) {
    try {
      // find which class is selected
      return await this.dashboardService.getMyStudents(selectedClass);
    } catch (error) {
      console.error(error);
    }
  }

  async getResultsByClass(selectedClass: any, curriculum, forms, item) {
    try {
      // find which class is selected
      return await this.dashboardService.getResultsByClass(selectedClass, curriculum, forms, item);
    } catch (error) {
      console.error(error);
    }
  }

  // ngAfterViewChecked() {
  //   if (!this.feedbackViewInited) {
  //     let el: HTMLElement = document.querySelector(".feedback-example")
  //     if (el) {
  //       el.style.backgroundColor = "lightgoldenrodyellow"
  //       el.style.margin = "1em"
  //       el.style.padding = "1em"
  //       this.feedbackViewInited = true
  //     }
  //     el = document.querySelector(".feedback-assignment")
  //     if (el) {
  //       el.style.backgroundColor = "lightgoldenrodyellow"
  //       el.style.margin = "1em"
  //       el.style.padding = "1em"
  //       this.feedbackViewInited = true
  //     }
  //   }
  // }

  getClassTitle = this.dashboardService.getClassTitle
  selectSubTask = this.dashboardService.selectSubTask

    async getCurriculaForms(curriculum) {
        const formHtml =  await this.http.get(`./assets/${curriculum}/form.html`, {responseType: 'text'}).toPromise();
        return formHtml;
    }
  
  
}
