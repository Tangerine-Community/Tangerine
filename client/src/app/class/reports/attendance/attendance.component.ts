import {Component, OnInit} from '@angular/core';
import {UserDatabase} from "../../../shared/_classes/user-database.class";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../../../shared/_services/user.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ClassUtils} from "../../class-utils";
import {ClassFormService} from "../../_services/class-form.service";
import {TangyFormsInfoService} from "../../../tangy-forms/tangy-forms-info-service";
import {DashboardService} from "../../_services/dashboard.service";
import {AppConfigService} from "../../../shared/_services/app-config.service";
import {VariableService} from "../../../shared/_services/variable.service";
import {DateTime} from "luxon";
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {StudentDetailsComponent} from "../../attendance/student-details/student-details.component";
@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private tangyFormsInfoService: TangyFormsInfoService,
    private dashboardService: DashboardService,
    private appConfigService: AppConfigService,
    private variableService: VariableService,
    private _bottomSheet: MatBottomSheet
  ) {
  }

  classUtils: ClassUtils;
  db: UserDatabase
  attendanceReports: any[]
  scoreReports: any[]
  attendanceReport: any
  scoreReport: any
  recentVisitsReport: any
  // @ViewChild('numVisits', {static: true}) searchResults: ElementRef
  // @Input()  numVisits!: number | string
  numVisits = 5
  classId: string;
  curriculi: any;
  curriculumName: string;
  curriculumFormsList;  // list of all curriculum forms
  // groupingsByCurriculum: any = {}
  allStudentScores: any = {}
  units: string[] = []
  selectedClass: any
  getValue: (variableName: any, response: any) => any;
  curriculum:any
  reportLocaltime: string;
  ignoreCurriculumsForTracking: boolean = false
  currArray: any[]
  attendancePrimaryThreshold: number
  attendanceSecondaryThreshold: number
  scoringPrimaryThreshold: number
  scoringSecondaryThreshold: number
  behaviorPrimaryThreshold: number
  behaviorSecondaryThreshold: number
  curriculumId
  currentIndex: number = 0
  currentReportsLength: number = 0
  showBackButton: boolean = true
  showForwardButton: boolean = true
  
  async ngOnInit(): Promise<void> {
    const classId = this.route.snapshot.paramMap.get('classId')
    this.classId = classId
    this.classUtils = new ClassUtils();

    const appConfig = await this.appConfigService.getAppConfig()
    const teachConfiguration = appConfig.teachProperties
    this.units = appConfig.teachProperties?.units
    this.attendancePrimaryThreshold = appConfig.teachProperties?.attendancePrimaryThreshold
    this.attendanceSecondaryThreshold = appConfig.teachProperties?.attendanceSecondaryThreshold
    this.scoringPrimaryThreshold = appConfig.teachProperties?.scoringPrimaryThreshold
    this.scoringSecondaryThreshold = appConfig.teachProperties?.scoringSecondaryThreshold
    this.behaviorPrimaryThreshold = appConfig.teachProperties?.behaviorPrimaryThreshold
    this.behaviorSecondaryThreshold = appConfig.teachProperties?.behaviorSecondaryThreshold
    this.curriculi = [];
    // const currentClass = await this.classFormService.getResponse(classId);

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
    this.currArray = currArray
    this.curriculumId = await this.variableService.get('class-curriculumId');
    this.curriculum = currArray.find(x => x.name === this.curriculumId);
    
    const classRegistration = this.classUtils.getInputValues(currentClass);
    const allCurriculums = classRegistration.curriculum;
    for (const curriculum of allCurriculums as any[]) {
      if (curriculum['value'] === 'on') {
        const formId = curriculum.name;
        const formInfo = await this.tangyFormsInfoService.getFormInfo(formId)
        curriculum.label = formInfo.title;
        this.curriculi.push(curriculum);
      }
    }

    // for (let i = 0; i < this.curriculi.length; i++) {
    //   const curriculum = this.curriculi[i];
    //   await this.onCurriculumSelect(curriculum.name)
    // }

    // const { attendanceReports, currentAttendanceReport } = await this.generateSummaryReport(currArray, curriculumId, currentClass, classId);
    this.attendanceReport = await this.generateSummaryReport(this.currArray, this.curriculumId, this.selectedClass, this.classId, null, this.currentIndex);
    // this.attendanceReport = currentAttendanceReport
    // const mostRecentAttendanceReport = attendanceReports.slice(0 - parseInt(this.numVisits, 10))
    // this.recentVisitsReport = await this.dashboardService.getRecentVisitsReport(mostRecentAttendanceReport)
    this.recentVisitsReport = await this.generateSummaryReport(this.currArray, this.curriculumId, this.selectedClass, this.classId, this.numVisits, this.currentIndex);
  }

  private async generateSummaryReport(currArray, curriculumId, currentClass, classId: string, numVisits: number, currentIndex: number = 0) {
    this.curriculum = currArray.find(x => x.name === curriculumId);
    let curriculumLabel = this.curriculum?.label
    // Set the curriculumLabel to null if ignoreCurriculumsForTracking is true.
    if (this.ignoreCurriculumsForTracking) {
      curriculumLabel = null
    }
    const randomId = currentClass.metadata?.randomId
    const students = await this.dashboardService.getMyStudents(classId);
    const attendanceReports = await this.dashboardService.searchDocs('attendance', currentClass, null, curriculumLabel, randomId, true)
    this.currentReportsLength = attendanceReports.length
    this.setForwardButton(currentIndex)
    this.setBackButton(currentIndex)
    const currentAttendanceReport = attendanceReports? attendanceReports[currentIndex]?.doc : null
    const savedAttendanceList = currentAttendanceReport?.attendanceList

    const attendanceListStarter = await this.dashboardService.getAttendanceList(students, savedAttendanceList, this.curriculum)
    const register = this.dashboardService.buildAttendanceReport(null, null, classId, null, null, null, null, 'attendance', attendanceListStarter);
    const attendanceList = register.attendanceList
    
    const scoreReports = []
    for (let i = 0; i < this.currArray.length; i++) {
      const curriculum = this.currArray[i];
      let curriculumLabel = curriculum?.label
      const reports = await this.dashboardService.searchDocs('scores', currentClass, null, curriculumLabel, randomId, true)
      reports.forEach((report) => {
        report.doc.curriculum = curriculum
        scoreReports.push(report.doc)
      })
    }
    const currentScoreReport = scoreReports[scoreReports.length - 1]

    if (currentAttendanceReport?.timestamp) {
      const timestampFormatted = DateTime.fromMillis(currentAttendanceReport?.timestamp)
      // DATE_MED
      this.reportLocaltime = timestampFormatted.toLocaleString(DateTime.DATE_FULL)
    } else {
      this.reportLocaltime = DateTime.now().toLocaleString(DateTime.DATE_FULL)
    }

    let scoreReport = currentScoreReport
    if (this.ignoreCurriculumsForTracking) {
      scoreReport = this.scoreReports
    }

    if (numVisits) {
      const selectedAttendanceReports = attendanceReports.slice(0,numVisits)
      for (let i = 0; i < selectedAttendanceReports.length; i++) {
        const attendanceReport = selectedAttendanceReports[i];
        const attendanceList = attendanceReport.doc.attendanceList
        await this.dashboardService.processAttendanceReport(attendanceList, register)
      }
    } else {
      await this.dashboardService.processAttendanceReport(attendanceList, register)
    }
    
    const behaviorReports = await this.dashboardService.searchDocs('behavior', currentClass, null, curriculumLabel, randomId, true)
    const currentBehaviorReport = behaviorReports[behaviorReports.length - 1]?.doc
    const behaviorList = currentBehaviorReport?.studentBehaviorList
    // await this.dashboardService.processBehaviorReport(behaviorList, register)

    if (numVisits) {
      const selectedBehaviorReports = behaviorReports.slice(0 - numVisits)
      for (let i = 0; i < selectedBehaviorReports.length; i++) {
        const attendanceReport = selectedBehaviorReports[i];
        const studentBehaviorList = attendanceReport.doc.studentBehaviorList
        await this.dashboardService.processBehaviorReport(studentBehaviorList, register)
      }
    } else {
      if (behaviorList) {
        await this.dashboardService.processBehaviorReport(behaviorList, register)
      }
    }

    for (let i = 0; i < attendanceList.length; i++) {
      const student = attendanceList[i]
      if (this.ignoreCurriculumsForTracking) {
        for (let j = 0; j < scoreReports.length; j++) {
          const report = scoreReports[j]
          const scoreCurriculum = report.curriculum
          // let curriculumLabel = curriculum?.label
          this.dashboardService.processScoreReport(report, student, this.units, this.ignoreCurriculumsForTracking, student, scoreCurriculum);
        }
      } else {
        this.dashboardService.processScoreReport(scoreReport, student, this.units, this.ignoreCurriculumsForTracking, student, this.curriculum);
      }
    }
    // return {attendanceReports, currentAttendanceReport};
    return register
  }

  async getUserDB() {
    return await this.userService.getUserDatabase();
  }


  async onNumberVisitsChange(event: any) {
    console.log('onNumberVisitsChange', event)
    console.log('numVisits: ', this.numVisits)
    if (this.numVisits) {
      // const mostRecentAttendanceReport = this.attendanceReports.slice(0 - parseInt(this.numVisits, 10))
      // const mostRecentAttendanceReport = this.attendanceReports.slice(0 - this.numVisits)
      // this.recentVisitsReport = await this.dashboardService.getRecentVisitsReport(mostRecentAttendanceReport)
      this.recentVisitsReport = await this.generateSummaryReport(this.currArray, this.curriculumId, this.selectedClass, this.classId, this.numVisits, this.currentIndex);
    }
  }
  
  /**
   * Grafted from task-report.component.ts
   * @param curriculumId
   */
  async onCurriculumSelect(curriculumId) {
    console.log('boom!: ' + curriculumId);

    const curriculum = this.curriculi.find((curriculum) => curriculum.name === curriculumId);
    const studentReportsCards = await this.dashboardService.generateStudentReportsCards(curriculum, this.classId)

    const rankedStudentScores = this.dashboardService.rankStudentScores(studentReportsCards);
    // this.groupingsByCurriculum[curriculumId] = rankedStudentScores
    this.allStudentScores[curriculumId] = rankedStudentScores.map((grouping) => {
      return {
        id: grouping.result.id,
        curriculum: grouping.result.curriculum,
        score: grouping.result.scorePercentageCorrect
      }
    })
    console.log("done")
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

  selectStudentDetails(student) {
    console.log("selectStudentDetails: ", student)
    student.ignoreCurriculumsForTracking = this.ignoreCurriculumsForTracking
    const studentId = student.id;
    const classId = student.classId;
    // this.router.navigate(['student-details'], { queryParams:
    //     { studentId: studentId, classId: classId }
    // });
    
    this._bottomSheet.open(StudentDetailsComponent, {
      data: { student: student,
        currentClass: this.selectedClass,
        curriculum: this.curriculum,},
    });
  }

  getClassTitle = this.dashboardService.getClassTitle

  async goBack() {
    const updatedIndex = this.currentIndex + 1
    this.setBackButton(updatedIndex)
    this.currentIndex = updatedIndex
    this.attendanceReport = await this.generateSummaryReport(this.currArray, this.curriculumId, this.selectedClass, this.classId, null, this.currentIndex);
  }
  async goForward() {
    const updatedIndex = this.currentIndex - 1
    this.setForwardButton(updatedIndex);
    this.currentIndex = updatedIndex
    this.attendanceReport = await this.generateSummaryReport(this.currArray, this.curriculumId, this.selectedClass, this.classId, null, this.currentIndex);
  }

  private setBackButton(updatedIndex) {
    console.log("goBack updatedIndex: " + updatedIndex)
    if (updatedIndex + 1 > this.currentReportsLength - 1) {
      console.log("Stop! goBack updatedIndex: " + updatedIndex)
      this.showBackButton = false
      // return
    } else {
      this.showBackButton = true
    }
  }

  private setForwardButton(updatedIndex) {
    console.log("goForward updatedIndex: " + updatedIndex)
    if (this.currentReportsLength - updatedIndex === this.currentReportsLength) {
      console.log("Stop! goForward currentIndex: " + updatedIndex)
      this.showForwardButton = false
      // return
    } else {
      this.showForwardButton = true
    }
  }
}
