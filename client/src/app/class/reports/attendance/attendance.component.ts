import { Component, OnInit } from '@angular/core';
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
  async ngOnInit(): Promise<void> {
    const classId = this.route.snapshot.paramMap.get('classId')
    this.attendanceReports = await this.getAttendanceDocs(classId)
    const currentAttendanceReport = this.attendanceReports[this.attendanceReports.length - 1]
    this.attendanceReports.forEach((attendanceReport) => {
      const attendanceList = attendanceReport.doc.attendanceList
      for (let i = 0; i < attendanceList.length; i++) {
        const student = attendanceList[i]
        const currentStudent = currentAttendanceReport.doc.attendanceList.find((thisStudent) => {
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
              // currentStudent.happyCount = currentStudent.happyCount ? currentStudent.happyCount + 1 : 1
              // currentStudent.happyPercentage = Math.round((currentStudent.happyCount / reportCount) * 100)
              currentStudent.moodValues.push(90)
              currentStudent.moodPercentage = Math.round(currentStudent.moodValues.reduce((a, b) => a + b, 0) / currentStudent.moodValues.length)
              break
            case 'neutral':
              // currentStudent.neutralCount = currentStudent.neutralCount ? currentStudent.neutralCount + 1 : 1
              // currentStudent.neutralPercentage = Math.round((currentStudent.neutralCount / reportCount) * 100)
              currentStudent.moodValues.push(70)
              currentStudent.moodPercentage = Math.round(currentStudent.moodValues.reduce((a, b) => a + b, 0) / currentStudent.moodValues.length)
              break
            case 'sad':
              // currentStudent.sadCount = currentStudent.sadCount ? currentStudent.sadCount + 1 : 1
              // currentStudent.sadPercentage = Math.round((currentStudent.sadCount / reportCount) * 100)
              currentStudent.moodValues.push(20)
              currentStudent.moodPercentage = Math.round(currentStudent.moodValues.reduce((a, b) => a + b, 0) / currentStudent.moodValues.length)
              break
          }
        }
      }
    })
    this.attendanceReport = currentAttendanceReport.doc
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

}
