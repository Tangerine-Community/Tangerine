import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { CASE_EVENT_SCHEDULE_LIST_MODE_DAILY, CASE_EVENT_SCHEDULE_LIST_MODE_WEEKLY, CaseEventScheduleListComponent } from '../case-event-schedule-list/case-event-schedule-list.component';
import moment from 'moment/src/moment'

@Component({
  selector: 'app-case-event-schedule',
  templateUrl: './case-event-schedule.component.html',
  styleUrls: ['./case-event-schedule.component.css']
})
export class CaseEventScheduleComponent implements OnInit {

  didSearch$ = new Subject()

  @ViewChild(CaseEventScheduleListComponent) list:CaseEventScheduleListComponent

  @Input()
  date:number

  @Input()
  mode = CASE_EVENT_SCHEDULE_LIST_MODE_DAILY

  constructor() { }

  ngOnInit() {
  }

  onWeekChange(event) {
    this.list.date = moment(`${event.target.yearInViewport} ${event.target.weekInViewport}`, 'YYYY WW').unix()*1000

    debugger
  }

}
