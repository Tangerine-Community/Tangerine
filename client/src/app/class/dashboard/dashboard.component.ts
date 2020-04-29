import { UserService } from 'src/app/shared/_services/user.service';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {DashboardService} from '../_services/dashboard.service';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {ClassFormService} from '../_services/class-form.service';
import {Router} from '@angular/router';
import {_TRANSLATE} from '../../shared/translation-marker';
import {CookieService} from 'ngx-cookie-service';
import {ClassUtils} from '../class-utils';
import {ClassGroupingReport} from '../reports/student-grouping-report/class-grouping-report';
import {TangyFormService} from '../../tangy-forms/tangy-form.service';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';

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

  cookieVersion = '1';
  classes; students;
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

  @ViewChild('container', {static: true}) container: ElementRef;

  constructor(
    private http: HttpClient,
    private dashboardService: DashboardService,
    private userService: UserService,
    private router: Router,
    private cookieService: CookieService,
    private classFormService: ClassFormService,
    private tangyFormService: TangyFormService,
    private tangyFormsInfoService: TangyFormsInfoService
  ) { }

  async ngOnInit() {
    (<any>window).Tangy = {};
    await this.classFormService.initialize();
    this.classes = await this.getMyClasses();
    this.classUtils = new ClassUtils();
    await this.initDashboard(null, null, null, null);
  }

  async initDashboard(classIndex: number, currentClassId, curriculumId, resetCookies) {
    if (typeof this.classes !== 'undefined' && this.classes.length > 0) {
      let currentClass, currentItemId = '';
      if (resetCookies) {
        this.cookieService.set('classIndex', classIndex.toString());
        this.cookieService.set('currentClassId', currentClassId);
        this.cookieService.set('curriculumId', curriculumId);
      }
      if (classIndex === null) {
        const cookieVersion = this.cookieService.get('cookieVersion');
        if (isNaN(parseInt(cookieVersion)) || cookieVersion !== this.cookieVersion) {
          this.cookieService.deleteAll();
          this.cookieService.set('cookieVersion', this.cookieVersion);
        } else {
          classIndex = parseInt(this.cookieService.get('classIndex'));
          currentItemId = this.cookieService.get('currentItemId');
          currentClassId = this.cookieService.get('currentClassId');
          curriculumId = this.cookieService.get('curriculumId');
        }
      }
      if (classIndex !== null) {
        this.currentClassIndex = classIndex;
      } else {
        this.currentClassIndex = 0;
        this.cookieService.set('classIndex', this.currentClassIndex);
      }

      currentClass = this.classes[this.currentClassIndex];
      this.selectedClass = currentClass;

      if (currentClassId && currentClassId !== '') {
        this.currentClassId = currentClassId;
      } else {
        this.currentClassId = currentClass.id;
        this.cookieService.set('currentClassId', this.currentClassId);
      }
      if (currentItemId && currentItemId !== '') {
        this.currentItemId = currentItemId;
      } else {
        this.currentItemId = null;
      }

      this.currArray = await this.populateCurrentCurriculums(currentClass);
      if (curriculumId === null || curriculumId === '') {
        const curriculum = this.currArray[0];
        curriculumId = curriculum.name;
      }
      this.curriculumId = curriculumId;
      this.cookieService.set('curriculumId', curriculumId);
      this.curriculum = this.currArray.find(x => x.name === curriculumId);
      await this.populateFormsMetadata(curriculumId);

      if (currentItemId === '') {
        const initialForm = this.curriculumFormsList[0];
        this.currentItemId = initialForm.id;
      }
      if (this.currentItemId) {
        this.selectSubTask(this.currentItemId, this.currentClassId, this.curriculumId);
      }

      // await this.populateFeedback(curriculumId);
      // console.log("this.classGroupReport item: " + item + " this.currentClassId: " + this.currentClassId + " curriculumId: " + curriculumId + "results: "  + JSON.stringify(results))
      // console.log("this.classGroupReport feedback: " + JSON.stringify(this.classGroupReport.feedback))
    }
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

  private async populateCurrentCurriculums(currentClass) {
    let inputs = [];
    currentClass.doc.items.forEach(item => inputs = [...inputs, ...item.inputs]);
    // find the curriculum element
    const curriculumInput = inputs.find(input => (input.name === 'curriculum') ? true : false);
    // find the options that are set to 'on'
    const currArray = curriculumInput.value.filter(input => (input.value === 'on') ? true : false);
    const fullCurrArray =  Promise.all(currArray.map(async curr => {
      const formId = curr.name;
      const formInfo = await this.tangyFormsInfoService.getFormInfo(formId)
      curr.label = formInfo.title
      return curr
    }));
    return fullCurrArray;
  }

// Populates this.curriculumFormsList and this.formList for a curriculum.
  async populateFormsMetadata(curriculumId) {
    const curriculumForms = [];
    // this only needs to happen once.
    const curriculumFormHtml = await this.dashboardService.getCurriculaForms(curriculumId);
    this.curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml);

    if (typeof this.curriculumFormsList === 'undefined') {
      const msg = `This is an error - there are no this.curriculumForms
      for this curriculum or range. Check if the config files are available.`;
      console.log(msg);
      alert(msg);
    }

    this.formList = [];
    let currentClassId;
    const currentClass = this.classes[this.currentClassIndex];
    if (typeof currentClass !== 'undefined') {
      currentClassId = currentClass.id;
    }
    for (const form of this.curriculumFormsList) {
      const formEl = {
        'title': form.title,
        'id': form.id,
        'classId': currentClassId,
        'curriculumId': curriculumId
      };
      this.formList.push(formEl);
    }

    this.selectedCurriculum = this.currArray.find(x => x.name === curriculumId);
    this.selectedClass = this.classes[this.currentClassIndex];
  }

  async selectSubTask(itemId, classId, curriculumId) {
    // console.log("selectSubTask itemId: " + itemId + " classId: " + classId + " curriculumId: " + curriculumId)
    this.cookieService.set( 'currentItemId', itemId );

    // this.currentClassId = this.selectedClass.id;
    this.students = await this.getMyStudents(classId);
    const item = this.curriculumFormsList.find(x => x.id === itemId);
    const results = await this.getResultsByClass(classId, this.curriculum.name, [item], item);
    this.studentsResponses = [];
    const formsTodisplay = {};
    this.curriculumFormsList.forEach(form => {
      formsTodisplay[form.id] = form;
    });
    for (const response of results as any[] ) {
      // console.log("response: " + JSON.stringify(response))
      // studentsResponses.push();
      if (formsTodisplay[response.formId] !== 'undefined') {
        const studentId = response.studentId;
        let studentReponses = this.studentsResponses[studentId];
        if (typeof studentReponses === 'undefined') {
          studentReponses = {};
        }
        const formId = response.formId;
        studentReponses[formId] = response;
        this.studentsResponses[studentId] = studentReponses;
      }
    }
    const allStudentResults = [];
    // for (const student of this.students) {
    this.students.forEach((student) => {
      const studentResults = {};
      studentResults['id'] = student.id;
      studentResults['name'] = student.doc.items[0].inputs[0].value;
      studentResults['classId'] = student.doc.items[0].inputs[3].value;
      // studentResults["forms"] = [];
      studentResults['forms'] = {};
      // for (const form of this.curriculumForms) {
      this.curriculumFormsList.forEach((form) => {
        const formResult = {};
        formResult['formId'] = form.id;
        formResult['curriculum'] = this.curriculum.name;
        formResult['title'] = form.title;
        formResult['src'] = form.src;
        if (this.studentsResponses[student.id]) {
          formResult['response'] = this.studentsResponses[student.id][form.id];
        }
        // studentResults["forms"].push(formResult)
        studentResults['forms'][form.id] = formResult;
      });
      allStudentResults.push(studentResults);
    });
    this.allStudentResults = allStudentResults;
    // await this.populateFeedback(curriculumId);
  }

  // Triggered by dropdown selection in UI.
  async populateCurriculum (classIndex, curriculumId) {
    const currentClass = this.classes[classIndex];
    const currentClassId = currentClass.id;
    await this.initDashboard(classIndex, currentClassId, curriculumId, true);
  }

  selectReport(reportId) {
    console.log('reportId: ' + reportId);
  }

  /** Populate the querystring with the form info. */
  selectCheckbox(column, itemId) {
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
    if (selectedForm['response']) {
      responseId = selectedForm['response']['_id'];
    }
    this.router.navigate(['class-forms-player'], { queryParams:
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
    this.router.navigate(['class-forms-player'], { queryParams:
        { formId: selectedFormId, curriculum: curriculum, studentId: studentId,
          classId: classId, itemId: selectedFormId, src: src, title:
          title, responseId: responseId }
    });
  }

  /** Populate the querystring with the form info. */
  selectStudentName(column) {
    const formsArray = Object.values(column.forms);
    const studentId = column.id;
    const classId = column.classId;
    this.router.navigate(['class-forms-player'], { queryParams:
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
        const result = await this.dashboardService.archiveStudentRegistration(studentId);
        console.log('result: ' + result);
      } catch (e) {
        console.log('Error deleting student: ' + e);
        return false;
      }
    }
  }

  /**
   * Fetch ./assets/${curriculum}/form.html, attach to the container, select all tangy-form-item objects
   * and push into a string array, limited by pageIndex and pageSize
   * @param curriculum
   * @param pageIndex
   * @param pageSize
   * @returns {Promise<any[]>}
   */
  async getCurriculaForms(curriculum, pageIndex, pageSize) {
    try {
      let selectedCurriculumForms, start, end, curriculumForms = [];
      const i = 1;
      if (pageIndex === 0) {
        start = 0;
        end = pageSize;
      } else {
        this.pageLength = Math.max(this.pageLength, 0);
        start = ((pageIndex * pageSize) > this.pageLength) ?
          (Math.ceil(this.pageLength / pageSize) - 1) * pageSize :
          pageIndex * pageSize;
        this.pageStart = start;
        end = Math.min(start + pageSize, this.pageLength);
        console.log( start + 1 + ' - ' + end + '  of  ' + this.pageLength);
      }

      // this only needs to happen once.
      const curriculumFormHtml = await this.dashboardService.getCurriculaForms(curriculum);
      const container = this.container.nativeElement;
      container.innerHTML = curriculumFormHtml;
      const formEl = container.querySelectorAll('tangy-form-item');
      const output = '';
      for (const el of formEl) {
        const attrs = el.attributes;
        const obj = {};
        for (let i = attrs.length - 1; i >= 0; i--) {
          // output = attrs[i].name + "->" + attrs[i].value;
          obj[attrs[i].name] = attrs[i].value;
          // console.log("this.formEl:" + output )
        }
        curriculumForms.push(obj);
      }
      this.curriculumFormsList = curriculumForms;

      this.formList = [];
      let currentClassId;
      const currentClass = this.classes[this.currentClassIndex];
      if (typeof currentClass !== 'undefined') {
        currentClassId = currentClass.id;
      }
      for (const form of this.curriculumFormsList) {
        const formEl = {
          'title': form.title,
          'id': form.id,
          'classId': currentClassId,
          'curriculumId': curriculum
        };
        this.formList.push(formEl);
      }

      // this.length = this.curriculumFormsList.length
      this.pageLength = this.curriculumFormsList.length;
      selectedCurriculumForms  = curriculumForms.slice(start, end);
      return selectedCurriculumForms;
    } catch (error) {
      console.error(error);
    }
  }

  async getMyClasses() {
    try {
      this.classes = await this.dashboardService.getMyClasses();
      // console.log("this.classes:" + JSON.stringify(this.classes))
      return this.classes;
    } catch (error) {
      console.error(error);
    }
  }

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
}
