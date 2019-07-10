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
  dayModeDate:number

  weekModeDate:number

  @Input()
  mode = CASE_EVENT_SCHEDULE_LIST_MODE_WEEKLY

  constructor() { }

  ngOnInit() {
    this.weekModeDate = moment(moment(new Date()).format('YYYY WW'), 'YYYY WW').unix()*1000
    this.dayModeDate = moment(moment(new Date()).format('YYYY MM DD'), 'YYYY MM DD').unix()*1000
    this.updateList()
  }

  onModeChange(event) {
    this.mode = event.target.value
    this.updateList()
  }

  updateList() {
    if (this.mode === CASE_EVENT_SCHEDULE_LIST_MODE_WEEKLY) {
      this.list.mode = this.mode
      this.list.date = this.weekModeDate
    } else if (this.mode === CASE_EVENT_SCHEDULE_LIST_MODE_DAILY) {
      this.list.mode = this.mode
      this.list.date = this.dayModeDate
    }
  }

  onWeekChange(event) {
    this.weekModeDate = moment(`${event.target.yearInViewport} ${event.target.weekInViewport}`, 'YYYY WW').unix()*1000
    this.updateList()
  }

  onDayPick(event) {
    this.dayModeDate = event.target.datePicked 
    this.updateList()
  }

}
