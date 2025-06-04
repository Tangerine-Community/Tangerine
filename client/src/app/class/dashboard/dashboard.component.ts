import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DashboardService} from '../_services/dashboard.service';
import {PageEvent} from '@angular/material/paginator';
import {ClassFormService} from '../_services/class-form.service';
import {ActivatedRoute, Router} from '@angular/router';
import {_TRANSLATE} from '../../shared/translation-marker';
import {ClassUtils} from '../class-utils';
import {ClassGroupingReport} from '../reports/student-grouping-report/class-grouping-report';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import {VariableService} from "../../shared/_services/variable.service";
import { TangyFormResponse } from 'src/app/tangy-forms/tangy-form-response.class';
import { DeviceService } from 'src/app/device/services/device.service';
import {BehaviorSubject, Subject, Subscription} from "rxjs";

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
  enabledClassesSubscription: Subscription;
  currArraySubscription: Subscription;
  classes; students; 
  enabledClasses; // filter out classes that have the 'archive' property.
  currentClassId; currentClassIndex;
  currentItemId; curriculumId;
  selectedClass; selectedCurriculum;
  curriculumInputValues: any[]; // array of curriculum input values

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
  classTitle: string;
  getValue: (variableName, response) => any;
  
  @ViewChild('container', {static: true}) container: ElementRef;

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private classFormService: ClassFormService,
    private tangyFormsInfoService: TangyFormsInfoService,
    private variableService: VariableService,
    private route: ActivatedRoute,
    private deviceService: DeviceService,
  ) { }

  getClassTitle(classResponse:TangyFormResponse) {
    const gradeInput = classResponse.items[0].inputs.find(input => input.name === 'grade')
    return gradeInput.value
  }

  async ngOnInit(): Promise<void> {
    let classIndex
    (<any>window).Tangy = {};
    this.getValue = this.dashboardService.getValue
    // Subscribe to the enabledClasses$ observable before you init it.
    this.enabledClassesSubscription = this.dashboardService.enabledClasses$.subscribe(async (enabledClasses) => {
      this.enabledClasses = enabledClasses
      console.log('enabledClasses: ' + JSON.stringify(this.enabledClasses))
    })
    this.currArraySubscription = this.dashboardService.currArray$.subscribe(async (currArray) => {
      this.currArray = currArray
      console.log('currArray: ' + JSON.stringify(this.currArray))
    })
    await this.classFormService.initialize();
    await this.dashboardService.initialize();
    
    if (typeof this.enabledClasses !== 'undefined' && this.enabledClasses.length > 0) {

      this.route.queryParams.subscribe(async params => {
        classIndex = params['classIndex'];
        let curriculumId = params['curriculumId'];

        const __vars = await this.dashboardService.initExposeVariables(classIndex, curriculumId);
        const currentClass = __vars.currentClass;
        if (!classIndex) {
          classIndex = __vars.classIndex;
        }
        curriculumId = __vars.curriculumId;
        this.selectedClass = currentClass;
        // When app is initialized, there is no curriculumId, so we need to set it to the first one.
        if (!curriculumId && this.currArray?.length > 0) {
          curriculumId = this.currArray[0].name
        }
        // const curriculum = this.currArray.find(x => x.name === curriculumId);

        const curriculumInputValues = currentClass.items[0].inputs.filter(input => input.name === 'curriculum')[0].value;
        this.curriculumInputValues = curriculumInputValues;
        const curriculum = curriculumInputValues.find(form => form.name === curriculumId);
        this.curriculum = curriculum;
        const currentClassId = currentClass._id;
        this.classTitle = this.getClassTitle(currentClass)
        // classResponse.items[0].inputs.find(input => input.name === 'grade')
        await this.initDashboard(classIndex, currentClassId, curriculumId, true);
      })
    }
    this.classUtils = new ClassUtils();
    await this.initDashboard(null, null, null, null);
  }

  async initDashboard(classIndex: number, currentClassId, curriculumId, resetVars) {
    if (typeof this.enabledClasses !== 'undefined' && this.enabledClasses.length > 0) {
      let currentClass, currentItemId = '';
      if (resetVars) {
        await this.variableService.set('class-classIndex', classIndex.toString());
        await this.variableService.set('class-currentClassId', currentClassId);
        await this.variableService.set('class-curriculumId', curriculumId);
      }
      this.currentClassIndex = 0;
      if (classIndex === null) {
        let classClassIndex = await this.variableService.get('class-classIndex')
        if (classClassIndex !== null) {
          classIndex = parseInt(classClassIndex)
          if (!Number.isNaN(classIndex)) {
            this.currentClassIndex = classIndex;
          }
        }
        currentItemId = await this.variableService.get('class-currentItemId');
        currentClassId = await this.variableService.get('class-currentClassId');
        curriculumId = await this.variableService.get('class-curriculumId');
      } else {
        this.currentClassIndex = classIndex
      }
      await this.variableService.set('class-classIndex', this.currentClassIndex);

      currentClass = this.enabledClasses[this.currentClassIndex];
      if (typeof currentClass === 'undefined') {
        // Maybe a class has been removed
        this.currentClassIndex = 0
        currentClass = this.enabledClasses[this.currentClassIndex];
      } else {
        this.selectedClass = currentClass;
      }

      if (currentClassId && currentClassId !== '') {
        this.currentClassId = currentClassId;
      } else {
        this.currentClassId = currentClass.id;
        await this.variableService.set('class-currentClassId', this.currentClassId);
      }
      if (currentItemId && currentItemId !== '') {
        this.currentItemId = currentItemId;
      } else {
        this.currentItemId = null;
      }

      // this.currArray = await this.populateCurrentCurriculums(currentClass);
      if (typeof curriculumId === 'undefined' || curriculumId === null || curriculumId === '') {
        const curriculum = this.currArray[0];
        curriculumId = curriculum;
      }
      this.curriculumId = curriculumId;
      await this.variableService.set('class-curriculumId', curriculumId);
      // this.curriculum = this.currArray.find(x => x.name === curriculumId);
      await this.populateFormsMetadata(curriculumId);

      if (!currentItemId || currentItemId === '') {
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
    let inputs = [], fullCurrArray
    currentClass.doc.items.forEach(item => inputs = [...inputs, ...item.inputs]);
    if (inputs.length > 0) {
      // find the curriculum element
      const curriculumInput = inputs.find(input => (input.name === 'curriculum') ? true : false);
      // find the options that are set to 'on'
      const currArray = curriculumInput.value.filter(input => (input.value === 'on') ? true : false);
      fullCurrArray =  Promise.all(currArray.map(async curr => {
        const formId = curr.name;
        const formInfo = await this.tangyFormsInfoService.getFormInfo(formId)
        curr.label = formInfo.title
        return curr
      }));
    }
   
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
    const currentClass = this.enabledClasses[this.currentClassIndex];
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

    this.selectedCurriculum = this.curriculumInputValues.find(x => x.name === curriculumId);
    // this.selectedClass = this.enabledClasses[this.currentClassIndex];
    this.selectedClass = this.dashboardService.getSelectedClass(this.enabledClasses, this.currentClassIndex);
  }

  async selectSubTask(itemId, classId, curriculumId) {
    // console.log("selectSubTask itemId: " + itemId + " classId: " + classId + " curriculumId: " + curriculumId)
    await this.variableService.set( 'class-currentItemId', itemId );

    // this.currentClassId = this.selectedClass.id;
    this.students = await this.getMyStudents(classId);
    const item = this.curriculumFormsList.find(x => x.id === itemId);
    const results = await this.getResultsByClass(classId, this.curriculum, [item], item);
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
    this.allStudentResults = await this.dashboardService.getAllStudentResults(this.students, this.studentsResponses, this.curriculumFormsList, this.curriculum);
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
      const currentClass = this.enabledClasses[this.currentClassIndex];
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

    ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.enabledClassesSubscription) {
      this.enabledClassesSubscription.unsubscribe();
    }
    if (this.currArraySubscription) {
      this.currArraySubscription.unsubscribe();
    }
  }
}
