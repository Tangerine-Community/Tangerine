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
import { ClassFormMetadata } from '../_classes/class-form-metadata.class';
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
  curriculumArraySubscription: Subscription;
  classes; 
  students; 
  enabledClasses; // filter out classes that have the 'archive' property.
  currentClassId; 
  currentClassIndex;
  currentItemId; 
  formId;
  selectedClass; 
  selectedFormItem;
  curriculumInputValues: any[]; // array of curriculum input values

  curriculumFormItemsList;
  curriculumForms;  // a subset of curriculumFormsList
  studentsResponses: any[];
  allStudentResults: StudentResult[];
  formColumns: string[] = [];
  formIds: string[] = [];
  formItemList: any[] = []; // used for the Dashboard user interface - creates Class grouping list
  formColumnsDS;

  // length = 10;
  pageLength = 10;
  pageSize = 5;
  pageIndex = 0;
  pageStart = 0;
  pageSizeOptions: number[] = [5, 10, 15, 100];
  reportsMenu;
  groupingMenu;
  studentRegistrationFormId = 'student-registration';
  classRegistrationParams = {
    formId: 'class-registration'
  };
  isLoading;

  pageEvent: PageEvent;
  classFormMetadata: ClassFormMetadata;
  curriculumArray: any[]; // array of curriculums in a class.
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
    })
    this.curriculumArraySubscription = this.dashboardService.curriculumArray$.subscribe(async (curriculumArray) => {
      this.curriculumArray = curriculumArray
    })
    await this.classFormService.initialize();
    await this.dashboardService.initialize();
    
    if (typeof this.enabledClasses !== 'undefined' && this.enabledClasses.length > 0) {

      this.route.queryParams.subscribe(async params => {
        classIndex = params['classIndex'];
        let formId = params['formId'];

        const __vars = await this.dashboardService.initExposeVariables(classIndex, formId);
        const currentClass = __vars.currentClass;
        if (!classIndex) {
          classIndex = __vars.classIndex;
        }
        formId = __vars.formId;
        this.selectedClass = currentClass;
        // When app is initialized, there is no formId, so we need to set it to the first one.
        if (!formId && this.curriculumArray?.length > 0) {
          formId = this.curriculumArray[0].name
        }

        const curriculumInputValues = currentClass.items[0].inputs.filter(input => input.name === 'curriculum')[0].value;
        this.curriculumInputValues = curriculumInputValues;
        const curriculum = curriculumInputValues.find(form => form.name === formId);
        this.classFormMetadata = new ClassFormMetadata(curriculum);
        const currentClassId = currentClass._id;
        this.classTitle = this.getClassTitle(currentClass)
        // classResponse.items[0].inputs.find(input => input.name === 'grade')
        await this.initDashboard(classIndex, currentClassId, formId, true);
      })
    }
    this.classUtils = new ClassUtils();
    await this.initDashboard(null, null, null, null);
  }

  async initDashboard(classIndex: number, currentClassId, formId, resetVars) {
    if (typeof this.enabledClasses !== 'undefined' && this.enabledClasses.length > 0) {
      let currentClass, currentItemId = '';
      if (resetVars) {
        await this.variableService.set('class-classIndex', classIndex.toString());
        await this.variableService.set('class-currentClassId', currentClassId);
        await this.variableService.set('class-formId', formId);
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
        formId = await this.variableService.get('class-formId');
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

      // this.curriculumArray = await this.populateCurrentCurriculums(currentClass);
      if (typeof formId === 'undefined' || formId === null || formId === '') {
        formId = this.curriculumArray[0];
      }
      this.formId = formId;
      await this.variableService.set('class-formId', formId);
      // this.classFormMetadata = this.curriculumArray.find(x => x.name === formId);
      await this.populateFormsMetadata(formId);

      if (!currentItemId || currentItemId === '') {
        const initialForm = this.curriculumFormItemsList[0];
        this.currentItemId = initialForm.id;
      }
      if (this.currentItemId) {
        this.selectSubTask(this.currentItemId, this.currentClassId, this.formId);
      }
    }
  }

// Populates this.curriculumFormItemsList and this.formItemList for a form.
  async populateFormsMetadata(formId) {
    // this only needs to happen once.
    const formHtml = await this.dashboardService.getForm(formId);
    this.curriculumFormItemsList = await this.classUtils.createCurriculumFormItemsList(formHtml);

    if (typeof this.curriculumFormItemsList === 'undefined') {
      const msg = `This is an error - there are no this.curriculumForms
      for this curriculum or range. Check if the config files are available.`;
      console.log(msg);
      alert(msg);
    }

    this.formItemList = [];
    let currentClassId;
    const currentClass = this.enabledClasses[this.currentClassIndex];
    if (typeof currentClass !== 'undefined') {
      currentClassId = currentClass.id;
    }
    for (const item of this.curriculumFormItemsList) {
      const formEl = {
        'title': item.title,
        'id': item.id,
        'classId': currentClassId,
        'formId': formId
      };
      this.formItemList.push(formEl);
    }

    this.selectedFormItem = this.formItemList.find(x => x.name === formId);
    // this.selectedClass = this.enabledClasses[this.currentClassIndex];
    this.selectedClass = this.dashboardService.getSelectedClass(this.enabledClasses, this.currentClassIndex);
  }

  async selectSubTask(itemId, classId, formId) {
    await this.variableService.set( 'class-currentItemId', itemId );

    // this.currentClassId = this.selectedClass.id;
    this.students = await this.getMyStudents(classId);
    const item = this.curriculumFormItemsList.find(x => x.id === itemId);
    const results = await this.getResultsByClass(classId, formId, [item], item);
    this.studentsResponses = [];
    const itemsToDisplay = {};
    this.curriculumFormItemsList.forEach(item => {
      itemsToDisplay[item.id] = item;
    });
    for (const response of results as any[] ) {
      if (itemsToDisplay[response.formId] !== 'undefined') {
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
    this.allStudentResults = await this.dashboardService.getAllStudentResults(this.students, this.studentsResponses, this.curriculumFormItemsList, this.classFormMetadata);
  }

  selectReport(reportId) {
    console.log('reportId: ' + reportId);
  }

  /** Populate the querystring with the form info. */
  async selectCheckbox(column, itemId) {
    // let el = this.selection.select(row);
    // this.selection.toggle(column)
    const formItemsArray = Object.values(column.formItems);
    const selectedFormItem = formItemsArray.find(input => (input['itemId'] === itemId) ? true : false);
    const studentId = column.id;
    const classId = column.classId;
    const selectedItemId = selectedFormItem['itemId'];
    const classFormMetadata = new ClassFormMetadata(selectedFormItem['classFormMetadata']);
    const formId = classFormMetadata.name
    const classFormLabel = classFormMetadata.labelSafe;
    const src = selectedFormItem['src'];
    const title = selectedFormItem['title'];
    let responseId = null;
    const classFormResponse = await this.dashboardService.getClassFormResponse(classId, classFormMetadata, studentId)
    if (classFormResponse) {
      responseId = classFormResponse._id
    }
    this.router.navigate(['class-form'], { queryParams:
        { sectionId: selectedItemId,
          formId: formId,
          classFormLabel: classFormLabel,
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
    event.currentTarget.checked = true;
    const formItemsArray = Object.values(column.formItems);
    const selectedFormItem = formItemsArray.find(input => (input['itemId'] === itemId) ? true : false);
    const studentId = column.id;
    const classId = column.classId;
    const selectedItemId = selectedFormItem['itemId'];
    const classFormMetadata = new ClassFormMetadata(selectedFormItem['classFormMetadata']);
    const formId = classFormMetadata.name;
    const src = selectedFormItem['src'];
    const title = selectedFormItem['title'];
    const responseId = selectedFormItem['response']['_id'];
    this.router.navigate(['class-form'], { queryParams:
        { itemId: selectedItemId, formId: formId, studentId: studentId,
          classId: classId, src: src, title:
          title, responseId: responseId }
    });
  }

  /** Navigate to the student registration form */
  selectStudentName(column) {
    const studentId = column.id;
    const classId = column.classId;
    this.router.navigate(['class-form'], { queryParams:
        { formId: 'student-registration', studentId: studentId, classId: classId, responseId: studentId, viewRecord: true }
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
   * Fetch ./assets/${formId}/form.html, attach to the container, select all tangy-form-item objects
   * and push into a string array, limited by pageIndex and pageSize
   * @param formId
   * @param pageIndex
   * @param pageSize
   * @returns {Promise<any[]>}
   */
  async getForm(formId, pageIndex, pageSize) {
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
      const formHtml = await this.dashboardService.getForm(formId);
      const container = this.container.nativeElement;
      container.innerHTML = formHtml;
      const formEl = container.querySelectorAll('tangy-form-item');
      for (const el of formEl) {
        const attrs = el.attributes;
        const obj = {};
        for (let i = attrs.length - 1; i >= 0; i--) {
          obj[attrs[i].name] = attrs[i].value;
        }
        curriculumForms.push(obj);
      }
      this.curriculumFormItemsList = curriculumForms;

      this.formItemList = [];
      let currentClassId;
      const currentClass = this.enabledClasses[this.currentClassIndex];
      if (typeof currentClass !== 'undefined') {
        currentClassId = currentClass.id;
      }
      for (const form of this.curriculumFormItemsList) {
        const formEl = {
          'title': form.title,
          'id': form.id,
          'classId': currentClassId,
          'formId': formId
        };
        this.formItemList.push(formEl);
      }

      this.pageLength = this.curriculumFormItemsList.length;
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

  async getResultsByClass(selectedClass: any, formId, forms, item) {
    try {
      // find which class is selected
      return await this.dashboardService.getResultsByClass(selectedClass, formId, forms, item);
    } catch (error) {
      console.error(error);
    }
  }

    ngOnDestroy() {
    // avoid memory leaks here by cleaning up after ourselves. If we
    // don't then we will continue to run our initialiseInvites()
    // method on every navigationEnd event.
    if (this.enabledClassesSubscription) {
      this.enabledClassesSubscription.unsubscribe();
    }
    if (this.curriculumArraySubscription) {
      this.curriculumArraySubscription.unsubscribe();
    }
  }
}
