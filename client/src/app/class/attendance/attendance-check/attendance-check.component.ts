import { Component, OnInit } from '@angular/core';
import {DateTime} from "luxon";
import {_TRANSLATE} from "../../../shared/translation-marker";
import {DashboardService} from "../../_services/dashboard.service";
import {VariableService} from "../../../shared/_services/variable.service";
import {Router} from "@angular/router";
import {StudentResult} from "../../dashboard/dashboard.component";
import {UserService} from "../../../shared/_services/user.service";
import {FormMetadata} from "../../form-metadata";
import {ClassFormService} from "../../_services/class-form.service";


@Component({
  selector: 'app-attendance-check',
  templateUrl: './attendance-check.component.html',
  styleUrls: ['./attendance-check.component.css','../../dashboard/dashboard.component.css']
})
export class AttendanceCheckComponent implements OnInit {
  
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
    items: any[],
    complete: boolean,
    type: string
  }
  selectedClass: any
  behaviorForms: Promise<FormMetadata[]>;
  
  constructor(
    private dashboardService: DashboardService,
              private variableService : VariableService,
              private router: Router,
              private classFormService: ClassFormService
  ) { }

  async ngOnInit(): Promise<void> {
    let classIndex
    await this.classFormService.initialize();
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
    const curriculum = currArray.find(x => x.name === curriculumId);
    
    const currentClassId = await this.variableService.get('class-currentClassId');
    await this.showAttendanceListing(currentClassId, curriculum, currentClass)
  }

  /**
   * Shim attendance into the currArray so it'll appear in the dropdown.
   * Makes attendance the selectedCurriculum.
   * @param cassId
   */
  async showAttendanceListing(currentClassId, curriculum, currentClass) {
    const type = "attendance"
    const registerNameForDialog = 'Attendance';
    this.behaviorForms = this.dashboardService.getBehaviorForms()
    const students = await this.dashboardService.getMyStudents(currentClassId);
    const schoolName = this.getValue('school_name', currentClass)
    const schoolYear = this.getValue('school_year', currentClass)
    const timestamp = Date.now()
    const {reportDate, grade, reportTime, id} = this.dashboardService.generateSearchableId(currentClass, type);

    let currentAttendanceReport, savedAttendanceList
    try {
      // currentAttendanceReport = await this.dashboardService.getDoc(id)
      const docArray = await this.dashboardService.searchDocs('attendance', currentClass, reportDate)
      currentAttendanceReport = docArray? docArray[0]?.doc : null
      savedAttendanceList = currentAttendanceReport?.attendanceList
    } catch (e) {
    }
    
    this.attendanceList =  await this.dashboardService.getAttendanceList(students, savedAttendanceList)
    if (!currentAttendanceReport) {
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
      const startRegister = confirm(_TRANSLATE('Begin ' + registerNameForDialog + ' record for today?'))
      if (startRegister) {
        // const curriculum = {
        //   'name': type,
        //   'value': 'on',
        //   'label': _TRANSLATE(registerNameForDialog)
        // }
        // this.currArray.push(curriculum)
        // this.selectedCurriculum = this.currArray.find(x => x.name === type)
        // await this.saveStudentAttendance(null)
      } else {
        // this.showAttendanceList = false
        // if (!this.currentItemId || this.currentItemId === '') {
        //   const initialForm = this.curriculumFormsList[0]
        //   this.currentItemId = initialForm.id
        // }
        // await this.selectSubTask(this.currentItemId, this.currentClassId, this.curriculumId)
        this.router.navigate(['/dashboard/']);
      }
    } else {
      currentAttendanceReport.attendanceList = this.attendanceList
      this.attendanceRegister = currentAttendanceReport
    }
    await this.saveStudentAttendance(null)
  }
  
  async toggleAttendance(student) {
    student.absent = !student.absent
    if (student.absent) {
      student.mood = ''
    }
    await this.saveStudentAttendance(student)
    // event.target.classList.toggle("active");
  }

  async toggleMood(mood, student) {
    student.mood = mood
    if (!student.absent) {
      await this.saveStudentAttendance(student)
    }
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

  /** Populate the querystring with the form info. */
  async selectCheckbox(column, formId) {
    // let el = this.selection.select(row);
    // this.selection.toggle(column)
    const formsArray = Object.values(column.forms);
    // const selectedForm = formsArray.find(response => (response['form']['id'] === formId));
    const studentId = column.id;
    const classId = column.classId;
    // const selectedFormId = selectedForm['formId'];
    const selectedFormId = formId
    // const curriculum = selectedForm['curriculum'];
    // const src = selectedForm['src'];
    // const title = selectedForm['title'];
    // let responseId = null;
    // const curriculumResponse = await this.dashboardService.getCurriculumResponse(classId, curriculum, studentId)
    // if (curriculumResponse) {
    //   responseId = curriculumResponse._id
    // }
    
    
    // this.router.navigate(['class-form'], { queryParams:
    //       { formId: selectedFormId,
    //         curriculum: curriculum,
    //         studentId: studentId,
    //         classId: classId,
    //         src: src,
    //         title: title,
    //         responseId: responseId }
    // });
  }

}
