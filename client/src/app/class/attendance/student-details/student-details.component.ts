import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {MatBottomSheetRef} from "@angular/material/bottom-sheet";
import {MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet';
import {AppConfigService} from "../../../shared/_services/app-config.service";
import {DashboardService} from "../../_services/dashboard.service";
import {DateTime} from "luxon";
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent,
  CalendarView,
} from 'angular-calendar';
import {
  startOfDay,
  endOfDay,
  subDays,
  addDays,
  endOfMonth,
  isSameDay,
  isSameMonth,
  addHours,
} from 'date-fns';
import { EventColor } from 'calendar-utils';
import {Subject} from "rxjs";
import {_TRANSLATE} from "../../../shared/translation-marker";

const colors: Record<string, EventColor> = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.css']
})
export class StudentDetailsComponent implements OnInit {

  @ViewChild('modalContent', { static: true }) modalContent: TemplateRef<any>;

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
  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;
  modalData: {
    action: string;
    event: CalendarEvent;
  };
  
  refresh = new Subject<void>();

  events: CalendarEvent[] = [];
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
    const attendanceReports = await this.dashboardService.searchDocs('attendance', this.data.currentClass, null, curriculumLabel, randomId, true)
    for (let i = 0; i < attendanceReports.length; i++) {
      const attendanceReport = attendanceReports[i].doc
      const timestamp = attendanceReport.timestamp
      const timestampFormatted = DateTime.fromMillis(timestamp)
      const timestampDate = timestampFormatted.toJSDate()
      // DATE_MED
      const reportLocaltime = timestampFormatted.toLocaleString(DateTime.DATE_FULL)
      const attendanceList = attendanceReport.attendanceList
      for (let j = 0; j < attendanceList.length; j++) {
        const attendance = attendanceList[j]
        if (attendance.id === studentId) {
          if (attendance.absent === true) {
            attendance.reportLocaltime = reportLocaltime
            records.push(attendance)
            events.push({
              start: startOfDay(timestampDate), 
              title: _TRANSLATE('Absent'),
              color: { ...colors.red },
              allDay: true,
            })
          }
        }
      }
      this.events = events
    }
    
    this.absentRecords = records
    
  }

  openLink(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

  setView(view: CalendarView) {
    this.view = view;
  }

}
