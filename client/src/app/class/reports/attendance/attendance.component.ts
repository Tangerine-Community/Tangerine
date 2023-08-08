import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {UserDatabase} from "../../../shared/_classes/user-database.class";
import {HttpClient} from "@angular/common/http";
import {UserService} from "../../../shared/_services/user.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private userService: UserService
  ) {
  }
  db: UserDatabase
  attendanceReports: any[]
  attendanceReport: any
  recentVisitsReport: any
  // @ViewChild('numVisits', {static: true}) searchResults: ElementRef
  // @Input()  numVisits!: number | string
  numVisits = '3'

  async ngOnInit(): Promise<void> {
    const classId = this.route.snapshot.paramMap.get('classId')
    this.attendanceReports = await this.getAttendanceDocs(classId)
    const currentAttendanceReport = this.attendanceReports[this.attendanceReports.length - 1]?.doc
    this.attendanceReports.forEach(this.processAttendanceReport(currentAttendanceReport))
    this.attendanceReport = currentAttendanceReport
    await this.getRecentVisitsReport()
  }

  private processAttendanceReport(currentAttendanceReport) {
    return (attendanceReport) => {
      const attendanceList = attendanceReport.doc.attendanceList
      for (let i = 0; i < attendanceList.length; i++) {
        const student = attendanceList[i]
        const currentStudent = currentAttendanceReport.attendanceList.find((thisStudent) => {
          return thisStudent.id === student.id
        })
        currentStudent.reportCount = currentStudent.reportCount ? currentStudent.reportCount + 1 : 1
        currentStudent.presentCount = currentStudent.presentCount ? currentStudent.presentCount : 0
        const absent = student.absent ? student.absent : false
        if (!absent) {
          currentStudent.presentCount = currentStudent.presentCount + 1
        }
        currentStudent.presentPercentage = Math.round((currentStudent.presentCount / currentStudent.reportCount) * 100)

        currentStudent.moodValues = currentStudent.moodValues ? currentStudent.moodValues : []
        const mood = student.mood
        if (mood) {
          switch (mood) {
            case 'happy':
              currentStudent.moodValues.push(90)
              currentStudent.moodPercentage = Math.round(currentStudent.moodValues.reduce((a, b) => a + b, 0) / currentStudent.moodValues.length)
              break
            case 'neutral':
              currentStudent.moodValues.push(70)
              currentStudent.moodPercentage = Math.round(currentStudent.moodValues.reduce((a, b) => a + b, 0) / currentStudent.moodValues.length)
              break
            case 'sad':
              currentStudent.moodValues.push(20)
              currentStudent.moodPercentage = Math.round(currentStudent.moodValues.reduce((a, b) => a + b, 0) / currentStudent.moodValues.length)
              break
          }
        }
      }
    };
  }

  async getUserDB() {
    return await this.userService.getUserDatabase();
  }
  async getAttendanceDocs(selectedClass: any) {
    this.db = await this.getUserDB();
    const result = await this.db.query('tangy-class/responsesForAttendanceByClassId', {
      startkey: [selectedClass],
      endkey: [selectedClass, {}],
      include_docs: true
    });
    return result.rows;
  }

  async getRecentVisitsReport() {
    const recentVisitsReport = {}
    recentVisitsReport['count'] = 3
    // const classId = this.route.snapshot.paramMap.get('classId')
    // const result = await this.db.query('tangy-class/recentVisitsByClassId', {
    //   startkey: [classId],
    //   endkey: [classId, {}],
    //   include_docs: true
    // });
    // return result.rows;
    const recentVisitReports = this.attendanceReports.slice(0 - parseInt(this.numVisits, 10))
    // const currentAttendanceReport = this.attendanceReports[this.attendanceReports.length - 1]
    // recentVisitReports.forEach(this.processAttendanceReport())

    // do a deep clone
    const recentVisitDoc = recentVisitReports[recentVisitReports.length - 1]?.doc
    const currentAttendanceReport = JSON.parse(JSON.stringify(recentVisitDoc))
    recentVisitReports.forEach(this.processAttendanceReport(currentAttendanceReport))
    this.recentVisitsReport = currentAttendanceReport
  }

  async onNumberVisitsChange(event: any) {
    console.log('onNumberVisitsChange', event)
    console.log('numVisits: ', this.numVisits)
    if (this.numVisits) {
      await this.getRecentVisitsReport()
    }
  }

}
