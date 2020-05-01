import {Component, OnInit, Input, ViewChild, ElementRef} from '@angular/core';
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

  @ViewChild(CaseEventScheduleListComponent, {static: true}) list:CaseEventScheduleListComponent
  @ViewChild('dateCarousel', {static: true}) dateCarousel:ElementRef

  @Input()
  dayModeDate:number

  weekModeDate:number

  weekInViewport:number
  yearInViewport:number
  datePicked:any
  today:number

  @Input()
  mode = CASE_EVENT_SCHEDULE_LIST_MODE_WEEKLY

  constructor() { }

  ngOnInit() {
    this.weekModeDate = moment(moment(new Date()).format('YYYY WW'), 'YYYY WW').unix()*1000
    this.dayModeDate = moment(moment(new Date()).format('YYYY MM DD'), 'YYYY MM DD').unix()*1000

    this.today = Date.now()
    this.datePicked = moment( new Date())
    this.yearInViewport = parseInt(this.datePicked.format('YYYY'))
    this.weekInViewport = parseInt(this.datePicked.format('W'))

    this.updateList()
    // Work around for some issue where the <date-carousel> component is not rendering on first init.
    setTimeout(() => {
      this.dateCarousel.nativeElement._next()
      this.dateCarousel.nativeElement._back()
    }, 100)
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
