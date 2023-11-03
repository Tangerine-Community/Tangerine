import { Component, OnInit } from '@angular/core';
import {_TRANSLATE} from "../../../shared/translation-marker";
import {DashboardService} from "../../_services/dashboard.service";
import {VariableService} from "../../../shared/_services/variable.service";
import {Router} from "@angular/router";
import {UserService} from "../../../shared/_services/user.service";
import {StudentResult} from "../../dashboard/dashboard.component";
import {FormMetadata} from "../../form-metadata";
import {ClassFormService} from "../../_services/class-form.service";
import {DateTime} from "luxon";

@Component({
  selector: 'app-behavior-check',
  templateUrl: './behavior-check.component.html',
  styleUrls: ['./behavior-check.component.css','../../dashboard/dashboard.component.css']
})
export class BehaviorCheckComponent implements OnInit {

  getValue: (variableName: any, response: any) => any;
  window: any = window
  studentBehaviorList: StudentResult[] = []
  register: {
    _id: string,
    timestamp: number,
    classId: string,
    grade: string,
    schoolName: string
    schoolYear: string,
    reportDate:string,
    studentBehaviorList: StudentResult[],
    collection: string,
    form: {},
    items: any[],
    complete: boolean,
    type: string
  }
  selectedClass: any
  behaviorForms: Promise<FormMetadata[]>;
  curriculum:any
  reportLocaltime: string;
  ignoreCurriculumsForTracking: boolean = false
  
  constructor(
    private dashboardService: DashboardService,
    private variableService : VariableService,
    private router: Router,
  ) { }

  async ngOnInit(): Promise<void> {
    let classIndex
    this.getValue = this.dashboardService.getValue
    const enabledClasses = await this.dashboardService.getEnabledClasses();

    let classClassIndex = await this.variableService.get('class-classIndex')
    if (classClassIndex !== null) {
      classIndex = parseInt(classClassIndex)
      if (Number.isNaN(classIndex)) {
        classIndex = 0
      }
    }

    const currentClass = this.dashboardService.getSelectedClass(enabledClasses, classIndex)
    this.selectedClass = currentClass;

    this.ignoreCurriculumsForTracking = this.dashboardService.getValue('ignoreCurriculumsForTracking', currentClass)

    const currArray = await this.dashboardService.populateCurrentCurriculums(currentClass);
    const curriculumId = await this.variableService.get('class-curriculumId');
    this.curriculum = currArray.find(x => x.name === curriculumId);

    const currentClassId = this.selectedClass._id
    await this.showBehaviorListing(currentClassId, this.curriculum, currentClass)
  }

  /**
   * Shim attendance into the currArray so it'll appear in the dropdown.
   * Makes attendance the selectedCurriculum.
   * @param cassId
   */
  async showBehaviorListing(currentClassId, curriculum, currentClass) {
    const type = "behavior"
    const registerNameForDialog = 'Behavior';
    this.behaviorForms = this.dashboardService.getBehaviorForms()
    const students = await this.dashboardService.getMyStudents(currentClassId);
    const schoolName = this.getValue('school_name', currentClass)
    const schoolYear = this.getValue('school_year', currentClass)
    const randomId = currentClass.metadata?.randomId
    const timestamp = Date.now()
    let curriculumLabel = curriculum?.label
    if (this.ignoreCurriculumsForTracking) {
      curriculumLabel = null
    }
    const {reportDate, grade, reportTime, id} = this.dashboardService.generateSearchableId(currentClass, curriculumLabel, type, randomId);

    let currentBehaviorReport, savedBehaviorList = null;
    try {
      const docArray = await this.dashboardService.searchDocs(type, currentClass, reportDate, curriculumLabel, randomId)
      currentBehaviorReport = docArray? docArray[0]?.doc : null
      savedBehaviorList = currentBehaviorReport?.studentBehaviorList
    } catch (e) {
    }
    
    if (currentBehaviorReport?.timestamp) {
      const timestampFormatted = DateTime.fromMillis(currentBehaviorReport?.timestamp)
      // DATE_MED
      this.reportLocaltime = timestampFormatted.toLocaleString(DateTime.DATE_FULL)
    } else {
      this.reportLocaltime = DateTime.now().toLocaleString(DateTime.DATE_FULL)
    }

    this.studentBehaviorList =  await this.dashboardService.getAttendanceList(students, savedBehaviorList, curriculum)
    if (!currentBehaviorReport) {
      this.register = {
        _id: id,
        timestamp: timestamp,
        classId: currentClassId,
        grade: grade,
        schoolName: schoolName,
        schoolYear: schoolYear,
        reportDate: reportDate,
        studentBehaviorList: this.studentBehaviorList,
        collection: 'TangyFormResponse',
        type: type,
        form: {
          id: 'form-internal-behaviour',
        },
        items: [{
          id: 'class-registration',
          title: 'Class Registration',
          inputs: [{}]
        },
          {
            id: 'item_1',
            title: 'Item 1',
            inputs: [{
              name: 'timestamp',
              label: 'timestamp'
            }]
          }],
        complete: false
      }
    } else {
      currentBehaviorReport.studentBehaviorList = this.studentBehaviorList
      this.register = currentBehaviorReport
    }
    await this.saveStudentBehavior(null)
  }

  private async saveStudentBehavior(student) {
    console.log('saving student behavior. ')
    // save allStudentResults
    this.register.studentBehaviorList = this.studentBehaviorList
    // save register
    let currentAttendanceReport
    try {
      currentAttendanceReport = await this.dashboardService.getDoc(this.register._id)
      this.register['_rev'] = currentAttendanceReport._rev
    } catch (e) {
    }

    await this.dashboardService.saveDoc(this.register)
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

  getClassTitle = this.dashboardService.getClassTitle

  /** Populate the querystring with the form info. */
  selectCheckboxResult(column, formId, event) {
    // let el = this.selection.select(column);
    event.currentTarget.checked = true;
    // this.selection.toggle(column)
    const formsArray = Object.values(column.forms);
    const selectedForm = formsArray.find(response => (response['formId'] === formId));
    const studentId = column.id;
    const classId = column.classId;
    // const selectedFormId = selectedForm['formId'];
    const selectedFormId = null;
    // const curriculum = selectedForm['curriculum'];
    const curriculum = formId;
    // const src = selectedForm['src'];
    const src = "./assets/form-internal-behaviour/form.html"
    // const title = selectedForm['title'];
    const title = "Behavior";
    // const responseId = selectedForm['response']['_id'];
    const responseId = column.behavior?.formResponseId
    this.router.navigate(['class-form'], { queryParams:
        { formId: selectedFormId, curriculum: curriculum, studentId: studentId,
          classId: classId, itemId: selectedFormId, src: src, title:
          title, responseId: responseId }
    });
  }

  /** 
   * This is for new forms without responses.
   * Populate the querystring with the form info. 
   **/
  async selectCheckbox(column, formId) {
    // let el = this.selection.select(row);
    // this.selection.toggle(column)
    // const formsArray = Object.values(column.forms);
    // const selectedForm = formsArray.find(response => (response['formId'] === formId));
    const studentId = column.id;
    const classId = column.classId;
    // const selectedFormId = selectedForm['formId'];
    const selectedFormId = null;
    // const curriculum = selectedForm['curriculum'];
    const curriculum = formId;
    const src = null;
    const title = null;
    let responseId = null;
    
    // const formResponse = await this.dashboardService.getCurriculumResponse(classId, curriculum, studentId)
    // const responses = await this.classFormService.getResponsesByStudentId(studentId);
    // for (const response of responses as any[]) {
    //   // const respClassId = response.doc.metadata.studentRegistrationDoc.classId;
    //   const respFormId = response.doc.form.id;
    //   // if (respClassId === this.classId && respCurrId === this.curriculum) {
    //   //   this.formResponse = response.doc;
    //   // }
    //   studentResult['forms'][respFormId] = response.doc;
    // }
    
    // if (selectedForm) {
    //   responseId = selectedForm['_id']
    // }
    
    this.router.navigate(['class-form'], { queryParams:
        { formId: selectedFormId,
          curriculum: curriculum,
          curriculumLabel: this.curriculum.label,
          reportDate: this.register.reportDate,
          studentId: studentId,
          classId: classId,
          src: src,
          title: title,
          responseId: responseId,
          newForm: true
        }
    });
  }

}
