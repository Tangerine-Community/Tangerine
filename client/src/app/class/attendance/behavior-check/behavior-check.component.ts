import { Component, OnInit } from '@angular/core';
import {_TRANSLATE} from "../../../shared/translation-marker";
import {DashboardService} from "../../_services/dashboard.service";
import {VariableService} from "../../../shared/_services/variable.service";
import {Router} from "@angular/router";
import {UserService} from "../../../shared/_services/user.service";
import {StudentResult} from "../../dashboard/dashboard.component";
import {FormMetadata} from "../../form-metadata";
import {ClassFormService} from "../../_services/class-form.service";

@Component({
  selector: 'app-behavior-check',
  templateUrl: './behavior-check.component.html',
  styleUrls: ['./behavior-check.component.css','../../dashboard/dashboard.component.css']
})
export class BehaviorCheckComponent implements OnInit {

  getValue: (variableName: any, response: any) => any;
  window: any = window
  attendanceList: StudentResult[] = []
  attendanceRegister: {
    _id: string,
    timestamp: number,
    classId: string,
    grade: string,
    schoolName: string
    schoolYear: string,
    reportDate:string,
    attendanceList: StudentResult[],
    collection: string,
    form: {},
    complete: boolean,
    type: string
  }
  selectedClass: any
  behaviorForms: Promise<FormMetadata[]>;
  curriculum:any
  
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

    const currentClass = enabledClasses[classIndex]?.doc;
    this.selectedClass = currentClass;
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
    const timestamp = Date.now()
    const curriculumLabel = this.curriculum.label
    const {reportDate, grade, reportTime, id} = this.dashboardService.generateSearchableId(currentClass, curriculumLabel, type);

    let currentAttendanceReport, savedAttendanceList = null;

    this.attendanceList =  await this.dashboardService.getAttendanceList(students, savedAttendanceList)
    // if (!currentAttendanceReport) {
      this.attendanceRegister = {
        _id: id,
        timestamp: timestamp,
        classId: currentClassId,
        grade: grade,
        schoolName: schoolName,
        schoolYear: schoolYear,
        reportDate: reportDate,
        attendanceList: this.attendanceList,
        collection: 'TangyFormResponse',
        type: type,
        form: {
          id: type,
        },
        complete: false
      }
      // const startRegister = confirm(_TRANSLATE('Begin ' + registerNameForDialog + ' record for today?'))
      // if (startRegister) {
      //   // const curriculum = {
      //   //   'name': type,
      //   //   'value': 'on',
      //   //   'label': _TRANSLATE(registerNameForDialog)
      //   // }
      //   // this.currArray.push(curriculum)
      //   // this.selectedCurriculum = this.currArray.find(x => x.name === type)
      //   await this.saveStudentAttendance(null)
      // } else {
      //   // this.showAttendanceList = false
      //   // if (!this.currentItemId || this.currentItemId === '') {
      //   //   const initialForm = this.curriculumFormsList[0]
      //   //   this.currentItemId = initialForm.id
      //   // }
      //   // await this.selectSubTask(this.currentItemId, this.currentClassId, this.curriculumId)
      //   this.router.navigate(['/dashboard/']);
      // }
    // } else {
    //   currentAttendanceReport.attendanceList = this.attendanceList
    //   this.attendanceRegister = currentAttendanceReport
    // }
  }

  private async saveStudentAttendance(student) {
    console.log('saved student attendance: ' + JSON.stringify(student))
    // save allStudentResults
    this.attendanceRegister.attendanceList = this.attendanceList
    // save attendanceRegister
    let currentAttendanceReport
    try {
      currentAttendanceReport = await this.dashboardService.getDoc(this.attendanceRegister._id)
      this.attendanceRegister['_rev'] = currentAttendanceReport._rev
    } catch (e) {
    }

    await this.dashboardService.saveDoc(this.attendanceRegister)
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
    const src = selectedForm['src'];
    const title = selectedForm['title'];
    // const responseId = selectedForm['response']['_id'];
    const responseId = selectedForm['_id'];
    this.router.navigate(['class-form'], { queryParams:
        { formId: selectedFormId, curriculum: curriculum, studentId: studentId,
          classId: classId, itemId: selectedFormId, src: src, title:
          title, responseId: responseId }
    });
  }

  /** Populate the querystring with the form info. */
  async selectCheckbox(column, formId) {
    // let el = this.selection.select(row);
    // this.selection.toggle(column)
    const formsArray = Object.values(column.forms);
    const selectedForm = formsArray.find(response => (response['formId'] === formId));
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
    
    if (selectedForm) {
      responseId = selectedForm['_id']
    }
    
    this.router.navigate(['class-form'], { queryParams:
        { formId: selectedFormId,
          curriculum: curriculum,
          studentId: studentId,
          classId: classId,
          src: src,
          title: title,
          responseId: responseId }
    });
  }

}
