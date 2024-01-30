import {
  Component,
  OnInit
} from '@angular/core';
import {_TRANSLATE} from "../../../shared/translation-marker";
import {DashboardService} from "../../_services/dashboard.service";
import {VariableService} from "../../../shared/_services/variable.service";
import {ActivatedRoute, Router} from '@angular/router';
import {DateTime} from "luxon";
import {AppConfigService} from "../../../shared/_services/app-config.service";

declare const sms: any;

@Component({
  selector: 'app-attendance-dashboard',
  templateUrl: './attendance-dashboard.component.html',
  styleUrls: ['./attendance-dashboard.component.css']
})
export class AttendanceDashboardComponent implements OnInit {

  currentClassId:string
  attendanceReport: any
  getValue: (variableName, response, provideCurriculumObject) => any;
  window: any = window
  selectedClass: any
  reportDate:string
  classRegistrationParams = {
    curriculum: 'class-registration'
  };
  curriculum: any;
  units: string[] = []
  ignoreCurriculumsForTracking: boolean = false
  reportLocaltime: string;
  currArray: any[]
  enabledClasses: any[]
  attendancePrimaryThreshold: number
  attendanceSecondaryThreshold: number
  scoringPrimaryThreshold: number
  scoringSecondaryThreshold: number
  behaviorPrimaryThreshold: number
  behaviorSecondaryThreshold: number
  cutoffRange: number
  ready = false
  
  constructor(
    private dashboardService: DashboardService,
    private variableService : VariableService,
    private router: Router,
    private route: ActivatedRoute,
    private appConfigService: AppConfigService,
  ) { }

  async ngOnInit(): Promise<void> {
    let classIndex
    this.getValue = this.dashboardService.getValue
    this.reportDate = DateTime.local().toISODate()
    this.reportLocaltime = DateTime.now().toLocaleString(DateTime.DATE_FULL)
    this.enabledClasses = await this.dashboardService.getEnabledClasses();
    const appConfig = await this.appConfigService.getAppConfig()
    this.units = appConfig.teachProperties?.units
    this.attendancePrimaryThreshold = appConfig.teachProperties?.attendancePrimaryThreshold
    this.attendanceSecondaryThreshold = appConfig.teachProperties?.attendanceSecondaryThreshold
    this.scoringPrimaryThreshold = appConfig.teachProperties?.scoringPrimaryThreshold
    this.scoringSecondaryThreshold = appConfig.teachProperties?.scoringSecondaryThreshold
    this.behaviorPrimaryThreshold = appConfig.teachProperties?.behaviorPrimaryThreshold
    this.behaviorSecondaryThreshold = appConfig.teachProperties?.behaviorSecondaryThreshold
    
    // new instance - no classes yet.
    if (typeof this.enabledClasses !== 'undefined' && this.enabledClasses.length > 0) {

      this.route.queryParams.subscribe(async params => {
        classIndex = params['classIndex'];
        let curriculumId = params['curriculumId'];
        
        const __vars = await this.dashboardService.initExposeVariables(classIndex, curriculumId);
        const currentClass = __vars.currentClass;
        curriculumId = __vars.curriculumId;
        this.selectedClass = currentClass;
        this.ready = true;
        const currArray = await this.dashboardService.populateCurrentCurriculums(currentClass);
        this.currArray = currArray
        // When app is initialized, there is no curriculumId, so we need to set it to the first one.
        if (!curriculumId && currArray?.length > 0) {
          curriculumId = currArray[0].name
        }
        this.curriculum = currArray.find(x => x.name === curriculumId);
        if (currentClass) {
          this.ignoreCurriculumsForTracking = this.dashboardService.getValue('ignoreCurriculumsForTracking', currentClass)
          await this.populateSummary(currentClass, this.curriculum)
        }
      })
    } else {
      this.ready = true;
    }
  }

  private async populateSummary(currentClass, curriculum) {
    const classId = currentClass._id
    const students = await this.dashboardService.getMyStudents(classId);
    const attendanceList =  await this.dashboardService.getAttendanceList(students, null, curriculum)
    const register= this.dashboardService.buildAttendanceReport(null, null, classId, null, null, null, null, 'attendance', attendanceList);
    
    let curriculumLabel = curriculum?.label
    // Set the curriculumLabel to null if ignoreCurriculumsForTracking is true.
    if (this.ignoreCurriculumsForTracking) {
      curriculumLabel = null
    }
    
    const randomId = currentClass.metadata?.randomId
    // const scoreReports = await this.dashboardService.getScoreDocs(classId)
    const scoreReports = []
    for (let i = 0; i < this.currArray.length; i++) {
      const curriculum = this.currArray[i];
      let curriculumLabel = curriculum?.label
      const reports = await this.dashboardService.searchDocs('scores', currentClass, null, null, curriculumLabel, randomId, true)
        reports.forEach((report) => {
        report.doc.curriculum = curriculum
        scoreReports.push(report.doc)
      })
    }
    const currentScoreReport = scoreReports[scoreReports.length - 1]

    const attendanceReports = await this.dashboardService.searchDocs('attendance', currentClass, '*', null, curriculumLabel, randomId, true)
      const behaviorReports = await this.dashboardService.searchDocs('behavior', currentClass, '*', null, curriculumLabel, randomId, true)
      // const currentBehaviorReport = behaviorReports[behaviorReports.length - 1]?.doc
    let scoreReport = currentScoreReport
    if (this.ignoreCurriculumsForTracking) {
      scoreReport = scoreReports
    }
    
    for (let i = 0; i < attendanceReports.length; i++) {
      const attendanceReport = attendanceReports[i];
      const attendanceList = attendanceReport.doc.attendanceList
      await this.dashboardService.processAttendanceReport(attendanceList, register)
    }

    for (let i = 0; i < behaviorReports.length; i++) {
      const behaviorReport = behaviorReports[i];
      const behaviorList = behaviorReport.doc.studentBehaviorList
      await this.dashboardService.processBehaviorReport(behaviorList, register)
    }

    for (let i = 0; i < attendanceList.length; i++) {
      const student = attendanceList[i]
      if (this.ignoreCurriculumsForTracking) {
        for (let j = 0; j < scoreReports.length; j++) {
          const report = scoreReport[j]
          const scoreCurriculum = report.curriculum
          // let curriculumLabel = curriculum?.label
          this.dashboardService.processScoreReport(report, student, this.units, this.ignoreCurriculumsForTracking, student, scoreCurriculum);
        }
      } else {
        this.dashboardService.processScoreReport(scoreReport, student, this.units, this.ignoreCurriculumsForTracking, student, curriculum);
      }
    }
    
    this.attendanceReport = register
    
    // const currentStudent = currentAttendanceReport.attendanceList.find((thisStudent) => {
    //   return thisStudent.id === student.id
    // })
  }

  sendText(student, type) {
    if (this.window.isCordovaApp) {

      const phone = student.phone
      if (!phone) {
        alert(_TRANSLATE('This student does not have a phone number'))
        return
      }

      let messageList = [];
      const message = _TRANSLATE('Report for ') + student.student_name + ': '
      messageList.push(message)

      if (student.presentPercentage) {
        let attendanceMessage = _TRANSLATE('Attendance') + ':' + student.presentPercentage + '%'
        messageList.push(attendanceMessage)
      }

      
      let behaviorMessage = ""
      if (student.behaviorPercentage) {
        behaviorMessage = _TRANSLATE('Behaviour') + ':' + student.behaviorPercentage + '%'
        messageList.push(behaviorMessage)
      }

      if (!this.ignoreCurriculumsForTracking) {
        if (student.score) {
          let scoresMessage = _TRANSLATE('Score average') + ':' + student.score + '%'
          messageList.push(scoresMessage)
        }
      } else {
        if (student.scores) {
          let scoresMessage = _TRANSLATE('Subject scores') + ':';
          messageList.push(scoresMessage)
          Object.entries(student.scores).forEach((scoreArr, _) => {
            const label = scoreArr[0];
            const score = scoreArr[1];
            const curriculum = this.currArray.find(c => c.labelSafe == label)
            if (curriculum && curriculum.label) {
              messageList.push(curriculum.label + ": " + score + "%")
            }
          })
        }
      }      
      
      const fullMessage = messageList.join("\n")

      const onSuccess = (result) => {
        console.log("Shared to app: " + result);
      };
      const onError = (msg) => {
        console.log("Sharing failed with message: " + msg)
        alert( _TRANSLATE('Something went wrong, please try again.'));
      };

      // options are only used in shareViaSMS and shareWithOptions
      let options = {
        message: fullMessage,
        subject: _TRANSLATE('Student Report'),
        phone: phone
      };

      if (type == 'sms') {
        // function shareViaSMS (options, phonenumbers, successCallback, errorCallback)
        this.window.plugins.socialsharing.shareViaSMS(options, phone, onSuccess, onError)
      } else if (type == 'whatsapp') {
        // function shareViaSMS(phone, message, fileOrFileArray, url, successCallback, errorCallback)
        this.window.plugins.socialsharing.shareViaWhatsAppToPhone(phone, fullMessage, null /* img */, null /* url */, onSuccess, onError)
      } else {
        this.window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
      }

    } else {
      alert(_TRANSLATE('This feature is only available on a mobile device.'))
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
