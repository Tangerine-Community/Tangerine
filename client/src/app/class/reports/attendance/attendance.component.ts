import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UserDatabase} from "../../../shared/_classes/user-database.class";
import {HttpClient} from "@angular/common/http";
import {FormGroup, FormControl} from '@angular/forms';
import {UserService} from "../../../shared/_services/user.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ClassUtils} from "../../class-utils";
import {ClassFormService} from "../../_services/class-form.service";
import {TangyFormsInfoService} from "../../../tangy-forms/tangy-forms-info-service";
import {DashboardService} from "../../_services/dashboard.service";
import {AppConfigService} from "../../../shared/_services/app-config.service";
import {VariableService} from "../../../shared/_services/variable.service";
import {DateTime, Interval, Settings} from "luxon";
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material/bottom-sheet';
import {StudentDetailsComponent} from "../../attendance/student-details/student-details.component";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { from } from 'rxjs';
import { MatDatepicker } from '@angular/material/datepicker';

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
    private _bottomSheet: MatBottomSheet,
    private dateAdapter: DateAdapter<Date>,
  ) {
  }

  classUtils: ClassUtils;
  db: UserDatabase
  attendanceReports: any[]
  scoreReports: any[]
  attendanceReport: any
  scoreReport: any
  dateRangeReport: any
  unitReport: any

  @ViewChild("startDate") rangeStartDatePicker: MatDatepicker<Date>;
  rangeMaxDate: Date = new Date();
  rangeStartDate:Date;
  rangeEndDate:Date = new Date();
  locale: string = 'en-US';

  beforeEndDateFilter = (d: Date | null): boolean => {
    // Prevent Saturday and Sunday from being selected.
    return DateTime.fromJSDate(d) <= DateTime.fromJSDate(this.rangeEndDate);
  };

  classId: string;
  curriculi: any;
  curriculumName: string;
  curriculumFormsList;  // list of all curriculum forms
  // groupingsByCurriculum: any = {}
  allStudentScores: any = {}
  units: string[] = []
  unitDates = []
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

  @ViewChild("unitTable") unitTable: ElementRef;
  
  async ngOnInit(): Promise<void> {
    const classId = this.route.snapshot.paramMap.get('classId')
    this.classId = classId
    this.classUtils = new ClassUtils();

    const languageCode = await this.variableService.get('languageCode')
    this.locale = languageCode.replace('_', '-');
    Settings.defaultLocale = this.locale

    this.dateAdapter.setLocale(this.locale);

    const appConfig = await this.appConfigService.getAppConfig()
    const teachConfiguration = appConfig.teachProperties
    this.units = appConfig.teachProperties?.units
    this.unitDates = appConfig.teachProperties?.unitDates
    this.unitDates.forEach((unitDate, index) => {
      const start = DateTime.fromFormat(unitDate.start, 'yyyy-MM-dd')
      const end = DateTime.fromFormat(unitDate.end, 'yyyy-MM-dd')
      const interval = Interval.fromDateTimes(start, end)
      unitDate.interval = interval
      unitDate.color = 'unit'+(index+1)
      const startLocaltime = start.toLocaleString(DateTime.DATE_MED)
      const endLocaltime = end.toLocaleString(DateTime.DATE_MED)
      const startDate = start.toISODate()
      const endDate = end.toISODate()
      unitDate.startLocaltime = startLocaltime
      unitDate.endLocaltime = endLocaltime
      unitDate.startDate = startDate
      unitDate.endDate = endDate
    })

    this.reportLocaltime = DateTime.now().toLocaleString(DateTime.DATE_FULL)

    // maybe make this relative to the selected date for the single day report table
    this.rangeStartDate = DateTime.now().minus({months: 1}).toJSDate();
    this.rangeEndDate = DateTime.now().toJSDate();

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
    this.curriculumId = await this.variableService.get('class-formId');
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

    this.attendanceReport = await this.generateSummaryReport(this.currArray, this.curriculum, this.selectedClass, this.classId, this.currentIndex, null, null);
    this.dateRangeReport = await this.generateSummaryReport(this.currArray, this.curriculum, this.selectedClass, this.classId, this.currentIndex, null, null);
  }

  private async generateSummaryReport(currArray, curriculum, currentClass, classId: string, currentIndex: number = 0, startDate: string, endDate: string) {
    // this.curriculum = currArray.find(x => x.name === curriculumId);
    let curriculumLabel = curriculum?.label
    // Set the curriculumLabel to null if ignoreCurriculumsForTracking is true.
    const ignoreCurriculumsForTracking = this.dashboardService.getValue('ignoreCurriculumsForTracking', currentClass)
    if (ignoreCurriculumsForTracking) {
      curriculumLabel = null
    }
    const randomId = currentClass.metadata?.randomId
    const students = await this.dashboardService.getMyStudents(classId);
    const attendanceReports = await this.dashboardService.searchDocs('attendance', currentClass, startDate, endDate, curriculumLabel, randomId, true)
    this.currentReportsLength = attendanceReports.length
    this.setForwardButton(currentIndex)
    this.setBackButton(currentIndex)
    const currentAttendanceReport = attendanceReports? attendanceReports[currentIndex]?.doc : null
    const currentAttendanceList = currentAttendanceReport?.attendanceList
    //
    // // const attendanceListStarter = await this.dashboardService.getAttendanceList(students, savedAttendanceList, this.curriculum)
    // const register = this.dashboardService.buildAttendanceReport(null, null, classId, null, null, null, null, 'attendance', savedAttendanceList);
    // const attendanceList = register.attendanceList
    const studentAttendanceList =  await this.dashboardService.getAttendanceList(students, null, curriculum)
    const register= this.dashboardService.buildAttendanceReport(null, null, classId, null, null, null, null, 'attendance', studentAttendanceList);
    const attendanceList = register.attendanceList
    
    const scoreReports = []
    for (let i = 0; i < currArray.length; i++) {
      const curriculum = currArray[i];
      let curriculumLabel = curriculum?.label
      const reports = await this.dashboardService.searchDocs('scores', currentClass, startDate, endDate, curriculumLabel, randomId, true)
      reports.forEach((report) => {
        report.doc.curriculum = curriculum
        scoreReports.push(report.doc)
      })
    }
    let scoreReport = scoreReports[scoreReports.length - 1]

    if (startDate && endDate) {
      const selectedAttendanceReports = attendanceReports
      for (let i = 0; i < selectedAttendanceReports.length; i++) {
        const attendanceReport = selectedAttendanceReports[i];
        const attendanceList = attendanceReport.doc.attendanceList
        await this.dashboardService.processAttendanceReport(attendanceList, register)
      }
    } else {
      await this.dashboardService.processAttendanceReport(currentAttendanceList, register)
    }
    
    const behaviorReports = await this.dashboardService.searchDocs('behavior', currentClass, startDate, endDate, curriculumLabel, randomId, true)
    const currentBehaviorReport = behaviorReports[behaviorReports.length - 1]?.doc
    const behaviorList = currentBehaviorReport?.studentBehaviorList
    // await this.dashboardService.processBehaviorReport(behaviorList, register)

    if (startDate && endDate) {
      const selectedBehaviorReports = behaviorReports
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
      if (ignoreCurriculumsForTracking) {
        for (let j = 0; j < scoreReports.length; j++) {
          const report = scoreReports[j]
          const scoreCurriculum = report.curriculum
          // let curriculumLabel = curriculum?.label
          this.dashboardService.processScoreReport(report, student, this.units, ignoreCurriculumsForTracking, student, scoreCurriculum);
        }
      } else {
        this.dashboardService.processScoreReport(scoreReport, student, this.units, ignoreCurriculumsForTracking, student, curriculum);
      }
    }
    return register
  }

  async getUserDB() {
    return await this.userService.getUserDatabase();
  }

  async onRangeDateChange(id:string, event: any) {
    if (id === 'rangeEndDateInput') {
      this.rangeEndDate = new Date(event.value)      
    } else if (id === 'rangeStartDateInput') {
      this.rangeStartDate = new Date(event.value)
    }

    let mostRecentDate = DateTime.fromJSDate(this.rangeEndDate)
    let previousDate = DateTime.fromJSDate(this.rangeStartDate)

    if (previousDate <= mostRecentDate) {
      this.dateRangeReport = await this.generateSummaryReport(this.currArray, this.curriculum, this.selectedClass, this.classId, this.currentIndex, 
        mostRecentDate.toISODate(), previousDate.toISODate());
    } else {
      this.rangeStartDatePicker.open();
    }
  }

  async showUnitReport(index) {
    const unitDate = this.unitDates[index]
    const startDate = unitDate.startDate
    const endDate = unitDate.endDate
    const reportName = unitDate.name
    const dateRange = unitDate.startLocaltime + ' - ' + unitDate.endLocaltime
    // Since we are querying backwards, we reverse startDate and endDate
    this.unitReport = await this.generateSummaryReport(this.currArray, this.curriculum, this.selectedClass, this.classId, this.currentIndex, endDate, startDate);
    this.unitReport.name = reportName
    this.unitReport.dateRange = dateRange
    setTimeout(() => {
      this.unitTable.nativeElement.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'});
    }, 500 );
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
    const studentId = column.id;
    const classId = column.classId;
    this.router.navigate(['class-form'], { queryParams:
        { formId: 'student-registration', studentId: studentId, classId: classId, responseId: studentId, viewRecord: true }
    });
  }

  selectStudentDetails(student) {
    student.ignoreCurriculumsForTracking = this.ignoreCurriculumsForTracking
    
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
    this.attendanceReport = await this.generateSummaryReport(this.currArray, this.curriculum, this.selectedClass, this.classId, this.currentIndex, null, null);

    if ( this.attendanceReport?.timestamp) {
      const timestampFormatted = DateTime.fromMillis( this.attendanceReport?.timestamp)
      this.reportLocaltime = timestampFormatted.toLocaleString(DateTime.DATE_FULL)
    } else {
      this.reportLocaltime = DateTime.now().toLocaleString(DateTime.DATE_FULL)
    }
  }
  async goForward() {
    const updatedIndex = this.currentIndex - 1
    this.setForwardButton(updatedIndex);
    this.currentIndex = updatedIndex
    this.attendanceReport = await this.generateSummaryReport(this.currArray, this.curriculum, this.selectedClass, this.classId, this.currentIndex, null, null);

    if ( this.attendanceReport?.timestamp) {
      const timestampFormatted = DateTime.fromMillis( this.attendanceReport?.timestamp)
      this.reportLocaltime = timestampFormatted.toLocaleString(DateTime.DATE_FULL)
    } else {
      this.reportLocaltime = DateTime.now().toLocaleString(DateTime.DATE_FULL)
    }
  }

  private setBackButton(updatedIndex) {
    // console.log("goBack updatedIndex: " + updatedIndex)
    if (updatedIndex + 1 > this.currentReportsLength - 1) {
      // console.log("Stop! goBack updatedIndex: " + updatedIndex)
      this.showBackButton = false
      // return
    } else {
      this.showBackButton = true
    }
  }

  private setForwardButton(updatedIndex) {
    // console.log("goForward updatedIndex: " + updatedIndex)
    if (this.currentReportsLength - updatedIndex === this.currentReportsLength) {
      // console.log("Stop! goForward currentIndex: " + updatedIndex)
      this.showForwardButton = false
      // return
    } else {
      this.showForwardButton = true
    }
  }
}
