import { Component, OnInit } from '@angular/core';
import {_TRANSLATE} from "../../../shared/translation-marker";
import {DashboardService} from "../../_services/dashboard.service";
import {VariableService} from "../../../shared/_services/variable.service";
import {Router} from '@angular/router';
import {DateTime} from "luxon";

declare const sms: any;

@Component({
  selector: 'app-attendance-dashboard',
  templateUrl: './attendance-dashboard.component.html',
  styleUrls: ['./attendance-dashboard.component.css']
})
export class AttendanceDashboardComponent implements OnInit {

  currentClassId:string
  attendanceReport: any
  getValue: (variableName: any, response: any) => any;
  window: any = window
  selectedClass: any
  reportDate:string
  classRegistrationParams = {
    curriculum: 'class-registration'
  };
  
  constructor(
    private dashboardService: DashboardService,
    private variableService : VariableService,
    private router: Router,
  ) { }

  async ngOnInit(): Promise<void> {
    let classIndex
    this.getValue = this.dashboardService.getValue
    this.reportDate = DateTime.local().toISODate()
    const enabledClasses = await this.dashboardService.getEnabledClasses();

    let classClassIndex = await this.variableService.get('class-classIndex')
    if (classClassIndex !== null) {
      classIndex = parseInt(classClassIndex)
      if (Number.isNaN(classIndex)) {
        classIndex = 0
      }
    }
    
    const currentClass = enabledClasses[classIndex]?.doc
    this.selectedClass = currentClass;
    
    // const currArray = await this.dashboardService.populateCurrentCurriculums(currentClass);
    // const curriculumId = await this.variableService.get('class-curriculumId');
    // const curriculum = currArray.find(x => x.name === curriculumId);
    //
    // const currentClassId = await this.variableService.get('class-currentClassId');
    // await this.populateSummary(currentClass, curriculum)
    if (currentClass) {
      await this.populateSummary(currentClass, null)
    }
  }

  private async populateSummary(currentClass, curriculum) {
    const classId = currentClass._id
    const students = await this.dashboardService.getMyStudents(classId);
    // const scoreReports = await this.dashboardService.getScoreDocs(classId)
    // const scoreReports = await this.dashboardService.searchDocs('scores', currentClass, null)
    // const currentScoreReport = scoreReports[scoreReports.length - 1]?.doc

    const attendanceReports = await this.dashboardService.searchDocs('attendance', currentClass, null)
    const currentAttendance = attendanceReports[attendanceReports.length - 1]
    const currentAttendanceReport = currentAttendance?.doc
    if (!currentAttendanceReport) {
      alert(_TRANSLATE('You must take attendance before you can view the attendance dashboard.'))
      this.router.navigate(['attendance-check'])
      return
    }

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

    // attendanceReports.forEach(this.dashboardService.processAttendanceReport(currentAttendanceReport, currentScoreReport, allStudentScores, students))
    attendanceReports.forEach(this.dashboardService.processAttendanceReport(currentAttendanceReport, null, allStudentScores, students))
    // const currentAttendanceReportArray = []
    // currentAttendanceReportArray.push(currentAttendance)
    // currentAttendanceReportArray.forEach(this.dashboardService.processAttendanceReport(currentAttendanceReport, currentScoreReport, allStudentScores, students))
    this.attendanceReport = currentAttendanceReport
    const studentsWithoutAttendance:any[] = students.filter((thisStudent) => {
      return !this.attendanceReport?.attendanceList.find((student) => {
        return thisStudent.doc._id === student.id
      })
    })
    // add any students who haven't had attendance taken yet to the attendanceList
    studentsWithoutAttendance.forEach((student) => {
      const studentResult = {}
      const student_name = this.getValue('student_name', student.doc)
      const phone = this.getValue('phone', student.doc);
      const classId = this.getValue('classId', student.doc)
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
        // const message = _TRANSLATE('Report for ') + student.name + ': ' + _TRANSLATE('Attendance is ') + student.presentPercentage + '%' + _TRANSLATE(' and behaviour is ') + student.moodPercentage + '%'
        const message = _TRANSLATE('Report for ') + student.name + ': ' + _TRANSLATE('Attendance is ') + student.presentPercentage + '%'
        sms.send(phone, message, options, success, error);
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
