import {
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';
import {AppConfigService} from "../../../shared/_services/app-config.service";
import {DashboardService} from "../../_services/dashboard.service";
import {DateTime, Interval} from "luxon";
import {KeyValue} from "@angular/common";
// import {
//   CalendarEvent,
//   CalendarEventAction,
//   CalendarEventTimesChangedEvent,
//   CalendarView,
// } from 'angular-calendar';
// import {
//   startOfDay,
//   endOfDay,
//   subDays,
//   addDays,
//   endOfMonth,
//   isSameDay,
//   isSameMonth,
//   addHours,
// } from 'date-fns';
// import { EventColor } from 'calendar-utils';
// import {Subject} from "rxjs";
// import {_TRANSLATE} from "../../../shared/translation-marker";

// const colors: Record<string, EventColor> = {
//   red: {
//     primary: '#ad2121',
//     secondary: '#FAE3E3',
//   },
//   blue: {
//     primary: '#1e90ff',
//     secondary: '#D1E8FF',
//   },
//   yellow: {
//     primary: '#e3bc08',
//     secondary: '#FDF1BA',
//   },
// };

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.css']
})
export class StudentDetailsComponent implements OnInit {

  // @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<StudentDetailsComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private appConfigService: AppConfigService,
    private dashboardService: DashboardService,
  ) {
  }

  units: string[] = []
  absentRecords: any[] = []
  curriculumLabel: string
  ignoreCurriculumsForTracking: boolean = false
  viewDate: Date = new Date();
  // view: CalendarView = CalendarView.Month;

  // CalendarView = CalendarView;
  // modalData: {
  //   action: string;
  //   event: CalendarEvent;
  // };
  
  // refresh = new Subject<void>();

  // events: CalendarEvent[] = [];
  absences: {}
  locale: string = 'es_GT';
  
  async ngOnInit(): Promise<void> {
    const appConfig = await this.appConfigService.getAppConfig()
    const teachConfiguration = appConfig.teachProperties
    this.units = appConfig.teachProperties?.units
    const currentClass = this.data.currentClass
    this.ignoreCurriculumsForTracking = this.dashboardService.getValue('ignoreCurriculumsForTracking', currentClass)

    let curriculumLabel = this.data.curriculum?.label
    // Set the curriculumLabel to null if ignoreCurriculumsForTracking is true.
    if (this.ignoreCurriculumsForTracking) {
      curriculumLabel = null
    }
    this.curriculumLabel = curriculumLabel
    const randomId = this.data.currentClass.metadata?.randomId
    const student = this.data.student
    const studentId = student.id

    const records = []
    const events = []
    const absences = {}
    
    // setup calendar
    // const dt = DateTime.now();
    // const month = dt.month;
    // for (let i = 0; i < 6; i++) {
    //   const monthDate = dt.set({month: month - i, day: 1})
    //   // events.push({
    //   //   month: monthDate, 
    //   // })
    //   const monthinFutureDate = dt.set({month: (month - i) + 1, day: 1})
    //   const monthNumber = monthDate.month
    //   const yearNumber = monthDate.year
    //   const monthInterval = Interval.fromDateTimes(monthDate, monthinFutureDate);
    //   const opts = {useLocaleWeeks: true}
    //   const monthDays = monthInterval.count('days')
    //  
    //   if (!absences[yearNumber]) {
    //     absences[yearNumber] = {}
    //   }
    //   if (!absences[yearNumber][monthNumber]) {
    //     absences[yearNumber][monthNumber] = {
    //       monthName: monthDate.toLocaleString({month: 'long'}),
    //       days:[]
    //     }
    //   }
    //   let currentWeekNumber = 0
    //   let dayOfWeek = 0
    //   let isEndOfWeek = false
    //   for (let j = 0; j < (monthDays - 1); j++) {
    //     const dayNumber = j+1
    //     const currentDate = dt.set({month: month - i, day: dayNumber})
    //     const endOfWeek = currentDate.endOf('week')
    //     isEndOfWeek = currentDate.day === endOfWeek.day;
    //     const weekNumber = currentDate.weekNumber
    //     let newWeek = false
    //     if (currentWeekNumber !== weekNumber) {
    //       newWeek = true
    //       currentWeekNumber = weekNumber
    //     }
    //     absences[yearNumber][monthNumber]['days'][dayNumber] = {
    //       weekNumber: weekNumber,
    //       newWeek: newWeek,
    //       isEndOfWeek: isEndOfWeek,
    //       absenceList: []
    //     }
    //   }
    // }
    
    const attendanceReports = await this.dashboardService.searchDocs('attendance', this.data.currentClass, null, curriculumLabel, randomId, true)
    for (let i = 0; i < attendanceReports.length; i++) {
      const attendanceReport = attendanceReports[i].doc
      const timestamp = attendanceReport.timestamp
      const timestampFormatted = DateTime.fromMillis(timestamp)
      const timestampDate = timestampFormatted.toJSDate()
      // DATE_MED
      const reportLocaltime = timestampFormatted.toLocaleString(DateTime.DATE_FULL)
      const attendanceList = attendanceReport.attendanceList
      // To get events into the calendar display
      for (let j = 0; j < attendanceList.length; j++) {
        const attendance = attendanceList[j]
        if (attendance.id === studentId) {
          if (attendance.absent === true) {
            attendance.reportLocaltime = reportLocaltime
            records.push(attendance)

            // const dayNumber = timestampFormatted.day
            // const monthNumber = timestampFormatted.month
            // const yearNumber = timestampFormatted.year
            //
            // const absence = {
            //   month: timestampDate,
            //   monthString: reportLocaltime
            // }
            // if (absences[yearNumber] && absences[yearNumber][monthNumber]['days'] && absences[yearNumber][monthNumber]['days'][dayNumber]) {
            //   absences[yearNumber][monthNumber]['days'][dayNumber]['absenceList'].push(absence)
            // }
            
            // var diffInMonths = end.diff(start, 'months');
            
            // events.push({
            //   start: startOfDay(timestampDate), 
            //   title: _TRANSLATE('Absent'),
            //   color: { ...colors.red },
            //   allDay: true,
            // })
            
            
          }
        }
      }
      // this.absences = absences
    }
    
    this.absentRecords = records
    
  }

  private onCompare(_left: KeyValue<any, any>, _right: KeyValue<any, any>): number {
    return 1;
  }

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

  // setView(view: CalendarView) {
  //   this.view = view;
  // }

}
