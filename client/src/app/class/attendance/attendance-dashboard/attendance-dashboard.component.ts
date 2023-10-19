import { Component, OnInit } from '@angular/core';
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
  
  constructor(
    private dashboardService: DashboardService,
    private variableService : VariableService,
    private router: Router,
    private route: ActivatedRoute,
    private appConfigService: AppConfigService
  ) { }

  async ngOnInit(): Promise<void> {
    let classIndex
    this.getValue = this.dashboardService.getValue
    this.reportDate = DateTime.local().toISODate()
    const enabledClasses = await this.dashboardService.getEnabledClasses();
    const appConfig = await this.appConfigService.getAppConfig()
    this.units = appConfig.teachProperties?.units

    // let classClassIndex = await this.variableService.get('class-classIndex')
    // if (classClassIndex !== null) {
    //   classIndex = parseInt(classClassIndex)
    //   if (Number.isNaN(classIndex)) {
    //     classIndex = 0
    //   }
    // }
    //
    // const currentClass = enabledClasses[classIndex]?.doc
    // this.selectedClass = currentClass;
    
    // new instance - no classes yet.
    if (typeof enabledClasses !== 'undefined' && enabledClasses.length > 0) {

      this.route.queryParams.subscribe(async params => {
        classIndex = params['classIndex'];
        let curriculumId = params['curriculumId'];
        
        const __vars = await this.dashboardService.initExposeVariables(classIndex, curriculumId);
        const currentClass = __vars.currentClass;
        curriculumId = __vars.curriculumId;
        this.selectedClass = currentClass;
        const currArray = await this.dashboardService.populateCurrentCurriculums(currentClass);
        // When app is initialized, there is no curriculumId, so we need to set it to the first one.
        if (!curriculumId && currArray?.length > 0) {
          curriculumId = currArray[0].name
        }
        this.curriculum = currArray.find(x => x.name === curriculumId);
        if (currentClass) {
          await this.populateSummary(currentClass, this.curriculum)
        }
      })
      
      // const __vars = await this.dashboardService.initExposeVariables(classIndex);
      // // classIndex = __vars.classIndex;
      // // currentItemId = __vars.currentItemId;
      // // currentClassId = __vars.currentClassId;
      // // curriculumId = __vars.curriculumId;
      // const currentClass = __vars.currentClass;
      // this.selectedClass = currentClass;
      //
      // // const currArray = await this.dashboardService.populateCurrentCurriculums(currentClass);
      // // const curriculumId = await this.variableService.get('class-curriculumId');
      // // const curriculum = currArray.find(x => x.name === curriculumId);
      // //
      // // const currentClassId = await this.variableService.get('class-currentClassId');
      // // await this.populateSummary(currentClass, curriculum)
      // if (currentClass) {
      //   await this.populateSummary(currentClass, null)
      // }
    }
  }

  private async populateSummary(currentClass, curriculum) {
    const classId = currentClass._id
    const students = await this.dashboardService.getMyStudents(classId);
    const curriculumLabel = curriculum?.label
    
    if (students.length === 0) {
      alert(_TRANSLATE('You must register students before you can view the attendance dashboard.'))
      this.router.navigate(['class-form'], { queryParams: {curriculum:'student-registration',classId:currentClass?._id} });
      return
    }
    
    // const scoreReports = await this.dashboardService.getScoreDocs(classId)
    const scoreReports = await this.dashboardService.searchDocs('scores', currentClass, null, null)
    const currentScoreReport = scoreReports[scoreReports.length - 1]?.doc

    const attendanceReports = await this.dashboardService.searchDocs('attendance', currentClass, null, curriculumLabel)
    const currentAttendance = attendanceReports[attendanceReports.length - 1]
    const currentAttendanceReport = currentAttendance?.doc
    if (!currentAttendanceReport) {
      alert(_TRANSLATE('You must take attendance before you can view the attendance dashboard.'))
      this.router.navigate(['attendance-check'])
      return
    }
    const behaviorReports = await this.dashboardService.searchDocs('behavior', currentClass, null, curriculumLabel)
    const currentBehaviorReport = behaviorReports[behaviorReports.length - 1]?.doc

    // const curriculum = this.curriculi.find((curriculum) => curriculum.name === curriculumId);
    // const studentReportsCards = await this.dashboardService.generateStudentReportsCards(curriculum, classId)
    //
    // const rankedStudentScores = this.dashboardService.rankStudentScores(studentReportsCards);
    // // this.groupingsByCurriculum[curriculumId] = rankedStudentScores
    // const curriculumName = curriculum.name
    const allStudentScores: any = {}
    // allStudentScores[curriculumName] = rankedStudentScores.map((grouping) => {
    //   return {
    //     id: grouping.result.id,
    //     curriculum: grouping.result.curriculum,
    //     score: grouping.result.scorePercentageCorrect
    //   }
    // })
    
    for (let i = 0; i < attendanceReports.length; i++) {
      const attendanceReport = attendanceReports[i];
      const attendanceList = attendanceReport.doc.attendanceList
      await this.dashboardService.processAttendanceReport(attendanceList, currentAttendanceReport, currentScoreReport, allStudentScores, students, this.units, currentBehaviorReport)
    }
    this.attendanceReport = currentAttendanceReport
    const studentsWithoutAttendance:any[] = students.filter((thisStudent) => {
      return !this.attendanceReport?.attendanceList.find((student) => {
        return thisStudent.doc._id === student.id
      })
    })
    // add any students who haven't had attendance taken yet to the attendanceList
    studentsWithoutAttendance.forEach((student) => {
      const studentResult = {}
      const student_name = this.getValue('student_name', student.doc, false)
      const phone = this.getValue('phone', student.doc, false);
      const classId = this.getValue('classId', student.doc, false)
      studentResult['id'] = student.id
      studentResult['name'] = student_name
      studentResult['phone'] = phone
      studentResult['classId'] = classId
      studentResult['forms'] = {}
      this.attendanceReport.attendanceList.push(studentResult)
    })
    // const currentStudent = currentAttendanceReport.attendanceList.find((thisStudent) => {
    //   return thisStudent.id === student.id
    // })
  }

  sendText(student) {
    console.log("send text")
    if (this.window.isCordovaApp) {
      //CONFIGURATION
      var options = {
        replaceLineBreaks: false, // true to replace \n by a new line, false by default
        android: {
          intent: 'INTENT'  // send SMS with the native android SMS messaging
          //intent: '' // send SMS without opening any other app, require : android.permission.SEND_SMS and android.permission.READ_PHONE_STATE
        }
      };

      var success = function () {
        // alert('Message sent successfully');
      };
      var error = function (e) {
        alert(_TRANSLATE('Message Failed:') + e);
      };
      const phone = student.phone
      if (!phone) {
        alert(_TRANSLATE('This student does not have a phone number.'))
        return
      } else {
        let attendanceMessage = _TRANSLATE('Attendance is: ') + student.presentPercentage + '%'
        
        let behaviorMessage = ""
        if (student['behavior'] && student['behavior']['internalPercentage']) {
          behaviorMessage = " ; " + _TRANSLATE('behaviour is: ') + student['behavior']['internalPercentage'] + '%'
        }
        let scoresMessage = "" +
          " ; " + _TRANSLATE('score average is: ') + student.score + "%"
        
        // const message = _TRANSLATE('Report for ') + student.name + ': ' + _TRANSLATE('Attendance is ') + student.presentPercentage + '%' + _TRANSLATE(' and behaviour is ') + student.moodPercentage + '%'
        const message = _TRANSLATE('Report for ') + student.name + ': ' + attendanceMessage + behaviorMessage + scoresMessage
        // sms.send(phone, message, options, success, error);

        let options = {
          // message: _TRANSLATE('Share this '), // not supported on some apps (Facebook, Instagram)
          message: message, // not supported on some apps (Facebook, Instagram)
          subject: _TRANSLATE('Student feedback '), // fi. for email
          chooserTitle: _TRANSLATE('Pick an app '), // Android only, you can override the default share sheet title
          phone: phone, // phone number to share (for WhatsApp only)
          number: phone, // phone number to share (for WhatsApp only) unused. delete.
          appPackageName: 'com.whatsapp' // Android only, you can provide id of the App you want to share with
        };

        const onSuccess = (result) => {
          // console.log("Share completed? " + result); // On Android apps mostly return false even while it's true
          console.log("Shared to app: " + result); // On Android result.app since plugin version 5.4.0 this is no longer empty. On iOS it's empty when sharing is cancelled (result.completed=false)
        };

        const onError = (msg) => {
          console.log("Sharing failed with message: " + msg);
          alert( _TRANSLATE('Sharing failed: WhatsApp may not be installed. The following apps are available for sharing: ') + msg);
        };
        // this.window.plugins.socialsharing.shareWithOptions(options, onSuccess, onError);
        this.window.plugins.socialsharing.shareViaWhatsAppToPhone(phone, message, null /* img */, null /* url */, onSuccess, onError)
      }
    } else {
      alert(_TRANSLATE('This feature is only available on a mobile device.'))
    }
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

}
