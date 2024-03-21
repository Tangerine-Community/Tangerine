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
import { TangySnackbarService } from 'src/app/shared/_services/tangy-snackbar.service';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';

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
  curriculum:any
  ignoreCurriculumsForTracking: boolean = false
  reportLocaltime: string;
  showLateAttendanceOption: boolean = false;
  
  constructor(
    private dashboardService: DashboardService,
              private variableService : VariableService,
              private router: Router,
              private classFormService: ClassFormService,
              private tangySnackbarService: TangySnackbarService,
              private appConfigService: AppConfigService
  ) { }

  async ngOnInit(): Promise<void> {

    const appConfig = await this.appConfigService.getAppConfig()
    this.showLateAttendanceOption = appConfig.teachProperties.showLateAttendanceOption || this.showLateAttendanceOption

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

    const currentClass = this.dashboardService.getSelectedClass(enabledClasses, classIndex)
    this.selectedClass = currentClass;
    this.ignoreCurriculumsForTracking = this.dashboardService.getValue('ignoreCurriculumsForTracking', currentClass)
    
    const currArray = await this.dashboardService.populateCurrentCurriculums(currentClass);
    const curriculumId = await this.variableService.get('class-curriculumId');
    this.curriculum = currArray.find(x => x.name === curriculumId);
    
    const currentClassId = this.selectedClass._id
    await this.showAttendanceListing(currentClassId, this.curriculum, currentClass)
  }

  /**
   * Shim attendance into the currArray so it'll appear in the dropdown.
   * Makes attendance the selectedCurriculum.
   * @param currentClassId
   * @param curriculum
   * @param currentClass
   */
  async showAttendanceListing(currentClassId, curriculum, currentClass) {
    const type = "attendance"
    this.behaviorForms = this.dashboardService.getBehaviorForms()
    const students = await this.dashboardService.getMyStudents(currentClassId);
    const schoolName = this.getValue('school_name', currentClass)
    const schoolYear = this.getValue('school_year', currentClass)
    const randomId = currentClass.metadata?.randomId
    const timestamp = Date.now()
    let curriculumLabel = curriculum.label
    if (this.ignoreCurriculumsForTracking) {
      curriculumLabel = null
    }
    const {reportDate, grade, reportTime, id} = this.dashboardService.generateSearchableId(currentClass, curriculumLabel, type, randomId);

    let currentAttendanceReport, savedAttendanceList
    try {
      // currentAttendanceReport = await this.dashboardService.getDoc(id)
      const docArray = await this.dashboardService.searchDocs('attendance', currentClass, reportDate, null, curriculumLabel, randomId, false)
      currentAttendanceReport = docArray? docArray[0]?.doc : null
      savedAttendanceList = currentAttendanceReport?.attendanceList
    } catch (e) {
    }

    if (currentAttendanceReport?.timestamp) {
      const timestampFormatted = DateTime.fromMillis(currentAttendanceReport?.timestamp)
      // DATE_MED
      this.reportLocaltime = timestampFormatted.toLocaleString(DateTime.DATE_FULL)
    } else {
      this.reportLocaltime = DateTime.now().toLocaleString(DateTime.DATE_FULL)
    }
    
    this.attendanceList =  await this.dashboardService.getAttendanceList(students, savedAttendanceList, curriculum)
    if (!currentAttendanceReport) {
      // TODO check if the currentAttendanceReport.timestamp or currentAttendanceReport.reportDate is today.
      const startRegister = confirm(_TRANSLATE('Begin Attendance record for today?'))
      if (startRegister) {
      } else {
        this.router.navigate(['/attendance-dashboard/']);
        return null
      }
      this.attendanceRegister = this.dashboardService.buildAttendanceReport(id, timestamp, currentClassId, grade, schoolName, schoolYear, reportDate, type, this.attendanceList);
    } else {
      currentAttendanceReport.attendanceList = this.attendanceList
      this.attendanceRegister = currentAttendanceReport
    }
    if (students.length > 0) {
      await this.saveStudentAttendance()
    }
    
  }

  async toggleAttendance(currentStatus, student) {
    if (this.showLateAttendanceOption) {
      if (currentStatus == 'present') {
        // moving from present status to late status, then they are not absent
        student.absent = false
        student.late = true
      } else if (currentStatus == 'late') {
        // moving from late status to absent status, then they are absent
        student.absent = true
        student.late = false
      } else {
        // moving from absent status to present status, then they are not absent
        student.absent = false
        student.late = false
      }
    } else {
      if (currentStatus == 'present') {
        // moving from present status to absent status, then they are absent
        student.absent = true
      } else {
        // moving from absent status to present status, then they are not absent
        student.absent = false
      }
    }

    await this.saveStudentAttendance()
  }

  private async saveStudentAttendance() {
    // save allStudentResults
    this.attendanceRegister.attendanceList = this.attendanceList
    // save attendanceRegister
    let currentAttendanceReport
    try {
      currentAttendanceReport = await this.dashboardService.getDoc(this.attendanceRegister._id)      
      this.attendanceRegister['_rev'] = currentAttendanceReport._rev
    } catch (e) {
      // Catches the non-existing doc error
    }
    
    try {
      await this.dashboardService.saveDoc(this.attendanceRegister)
      this.tangySnackbarService.showText(_TRANSLATE('Saved'));
    } catch (e) {
      this.tangySnackbarService.showText(_TRANSLATE('Error saving. Please try again.'));
    }
  }

  /** Navigate to the student registration form */
  selectStudentName(column) {
    const studentId = column.id;
    const classId = column.classId;
    this.router.navigate(['class-form'], { queryParams:
        { curriculum: 'student-registration', studentId: studentId, classId: classId, responseId: studentId, viewRecord: true }
    });
  }

  getClassTitle = this.dashboardService.getClassTitle

}
