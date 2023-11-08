import {Component, Inject, OnInit} from '@angular/core';
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';
import {AppConfigService} from "../../../shared/_services/app-config.service";
import {DashboardService} from "../../_services/dashboard.service";
import {DateTime} from "luxon";

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.css']
})
export class StudentDetailsComponent implements OnInit {

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<StudentDetailsComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private appConfigService: AppConfigService,
    private dashboardService: DashboardService
  ) {
  }

  units: string[] = []
  absentRecords: any[] = []
  curriculumLabel: string
  
  async ngOnInit(): Promise<void> {
    const appConfig = await this.appConfigService.getAppConfig()
    const teachConfiguration = appConfig.teachProperties
    this.units = appConfig.teachProperties?.units
    this.curriculumLabel = this.data.curriculum?.label
    const randomId = this.data.currentClass.metadata?.randomId
    const student = this.data.student
    const studentId = student.id

    const records = []
    const attendanceReports = await this.dashboardService.searchDocs('attendance', this.data.currentClass, null, this.curriculumLabel, randomId, true)
    for (let i = 0; i < attendanceReports.length; i++) {
      const attendanceReport = attendanceReports[i].doc
      const timestamp = attendanceReport.timestamp
      const timestampFormatted = DateTime.fromMillis(timestamp)
      // DATE_MED
      const reportLocaltime = timestampFormatted.toLocaleString(DateTime.DATE_FULL)
      const attendanceList = attendanceReport.attendanceList
      for (let j = 0; j < attendanceList.length; j++) {
        const attendance = attendanceList[j]
        if (attendance.id === studentId) {
          if (attendance.absent === true) {
            attendance.reportLocaltime = reportLocaltime
            records.push(attendance)
          }
        }
      }
    }
    
    this.absentRecords = records
    
    // console.log(attendanceReports)
  }

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

}
