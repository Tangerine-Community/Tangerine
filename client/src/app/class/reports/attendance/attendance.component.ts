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
    this.attendanceReport = await this.generateSummaryReport(this.currArray, this.curriculumId, this.selectedClass, this.classId, null);
    // this.attendanceReport = currentAttendanceReport
    // const mostRecentAttendanceReport = attendanceReports.slice(0 - parseInt(this.numVisits, 10))
    // this.recentVisitsReport = await this.dashboardService.getRecentVisitsReport(mostRecentAttendanceReport)
    this.recentVisitsReport = await this.generateSummaryReport(this.currArray, this.curriculumId, this.selectedClass, this.classId, this.numVisits);
  }

  private async generateSummaryReport(currArray, curriculumId, currentClass, classId: string, numVisits: number) {
    this.curriculum = currArray.find(x => x.name === curriculumId);
    let curriculumLabel = this.curriculum?.label
    // Set the curriculumLabel to null if ignoreCurriculumsForTracking is true.
    if (this.ignoreCurriculumsForTracking) {
      curriculumLabel = null
    }
    const randomId = currentClass.metadata?.randomId

    const attendanceReports = await this.dashboardService.searchDocs('attendance', currentClass, null, curriculumLabel, randomId, true)
    const students = await this.dashboardService.getMyStudents(classId);

    const currentAttendanceReport = attendanceReports[attendanceReports.length - 1]?.doc
    const savedAttendanceList = currentAttendanceReport?.attendanceList

    const attendanceList = await this.dashboardService.getAttendanceList(students, savedAttendanceList, this.curriculum)
    const register = this.dashboardService.buildAttendanceReport(null, null, classId, null, null, null, null, 'attendance', attendanceList);

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
      const selectedAttendanceReports = attendanceReports.slice(0 - numVisits)
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
    return currentAttendanceReport
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
      this.recentVisitsReport = await this.generateSummaryReport(this.currArray, this.curriculumId, this.selectedClass, this.classId, this.numVisits);
    }
  }
  
  /**
   * Grafted from task-report.component.ts
   * @param curriculumId
   */
  async onCurriculumSelect(curriculumId) {
    console.log('boom!: ' + curriculumId);
    // // const totals = [];
    // const studentReportsCards: StudentReportsCards = {};
    // const curriculum = this.curriculi.find((curriculum) => curriculum.name === curriculumId);
    // // this.curriculumName = curriculum.label;
    // // // this.curriculumName = "Student Evaluation";
    // try {
    //   const curriculumFormHtml = await this.dashboardService.getCurriculaForms(curriculumId);
    //   this.curriculumFormsList = await this.classUtils.createCurriculumFormsList(curriculumFormHtml);
    //   const itemReport = await Promise.all(this.curriculumFormsList.map(async item => {
    //       const results = await this.dashboardService.getResultsByClass(this.classId, curriculumId, this.curriculumFormsList, item);
    //       if (results.length > 0) {
    //         return await this.dashboardService.getClassGroupReport(item, this.classId, curriculumId, results);
    //       }
    //     })
    //   );
    //   Object.keys(itemReport).forEach((item) => {
    //     if (typeof itemReport[item] !== 'undefined') {
    //       const report: ClassGroupingReport = itemReport[item];
    //       const allStudentResults: Array<StudentResult> = report.allStudentResults;
    //       const reduceClassAverage = (p, studentResult) => {
    //         return (typeof studentResult.scorePercentageCorrect !== 'undefined' ? p + studentResult.scorePercentageCorrect : p);
    //       };
    //       const calcAverage = array => array.reduce(reduceClassAverage, 0) / array.length;
    //       const average = Math.round(calcAverage(allStudentResults));
    //
    //       // now add array of studentResults to each student's record.
    //       const collectStudentResults = (studentResult: StudentResult) => {
    //         let reportCard = studentReportsCards[studentResult.id];
    //         if (typeof reportCard === 'undefined') {
    //           reportCard = new StudentResult();
    //           reportCard.results = new Array<StudentResult>();
    //           reportCard.curriculum = curriculum;
    //           reportCard.name = studentResult.name;
    //           reportCard.id = studentResult.id;
    //         }
    //         reportCard.results.push(studentResult);
    //         studentReportsCards[studentResult.id] = reportCard;
    //         // let average = typeof studentResult.scorePercentageCorrect !== 'undefined'? studentAverage.scorePercentageCorrect + studentResult.scorePercentageCorrect:studentAverage.scorePercentageCorrect
    //
    //         // add studentAverage to studentAverages object.
    //       };
    //       allStudentResults.forEach(collectStudentResults);
    //
    //       // totals.push({
    //       //   itemId: report.itemId,
    //       //   itemName: report.subtestName,
    //       //   average: average,
    //       //   classSize: report.classSize,
    //       //   studentsAssessed: report.studentsAssessed
    //       // });
    //     }
    //   });

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
  
  
  
}
