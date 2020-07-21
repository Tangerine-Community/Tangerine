import { TangyFormResponse } from './../../../tangy-forms/tangy-form-response.class';
import { FormInfo } from './../../../tangy-forms/classes/form-info.class';
import { CaseDefinition } from 'src/app/case/classes/case-definition.class';
import { FORM_TYPES_INFO } from './../../../core/search/search.component';
import { CaseService } from 'src/app/case/services/case.service';
import { TangyFormsInfoService } from './../../../tangy-forms/tangy-forms-info-service';
import { SearchService } from './../../../shared/_services/search.service';
import { UserService } from './../../../shared/_services/user.service';
import { CasesService } from './../../../case/services/cases.service';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import * as moment from 'moment'
import { CaseEvent } from 'src/app/case/classes/case-event.class';
export const CASE_EVENT_SCHEDULE_LIST_MODE_DAILY = 'CASE_EVENT_SCHEDULE_LIST_MODE_DAILY'
export const CASE_EVENT_SCHEDULE_LIST_MODE_WEEKLY = 'CASE_EVENT_SCHEDULE_LIST_MODE_WEEKLY'

//import { FORMAT_YEAR_WEEK, FORMAT_YEAR_MONTH_DAY } from 'date-carousel/date-carousel.js'
const FORMAT_YEAR_WEEK = 'YYYY-w'
const FORMAT_YEAR_MONTH_DAY = 'YYYY-MM-DD'

class CaseEventInfo {
  dateNumber = ''
  dateLabel = ''
  openLink = ''
  scheduleListItemIcon:string
  scheduleListItemPrimary:string
  scheduleListItemSecondary:string
}

@Component({
  selector: 'app-case-event-schedule',
  templateUrl: './case-event-schedule.component.html',
  styleUrls: ['./case-event-schedule.component.css']
})
export class CaseEventScheduleComponent implements OnInit {

  didSearch$ = new Subject()

  weekInView:string = moment().format(FORMAT_YEAR_WEEK)
  datePicked:string = moment().format(FORMAT_YEAR_MONTH_DAY)

  // Start with week mode.
  mode = CASE_EVENT_SCHEDULE_LIST_MODE_WEEKLY

  formTypesInfo = FORM_TYPES_INFO
  caseEventInfos:Array<CaseEventInfo> = []
  formsInfo:Array<FormInfo>

  constructor(
    private casesService:CasesService,
    private userService:UserService,
    private formsInfoService:TangyFormsInfoService,
    private caseService:CaseService,
    private ref: ChangeDetectorRef
  ) {
    ref.detach()
  }

  async ngOnInit() {
    this.render(await this.calculateEvents())
  }

  async onModeChange(event) {
    this.mode = event.target.value
    this.render(await this.calculateEvents())
  }

  async onWeekChange(event) {
    this.weekInView = event.target.weekInView
    this.render(await this.calculateEvents())
  }

  async onDayPick(event) {
    this.datePicked = event.target.datePicked
    this.render(await this.calculateEvents())
  }

  async calculateEvents() {
    let startDate = this.mode === CASE_EVENT_SCHEDULE_LIST_MODE_DAILY
      ? this.datePicked
      : moment(this.weekInView, FORMAT_YEAR_WEEK).format(FORMAT_YEAR_MONTH_DAY)
    let endDate = this.mode === CASE_EVENT_SCHEDULE_LIST_MODE_DAILY
      ? this.datePicked 
      : moment(this.weekInView, FORMAT_YEAR_WEEK).add(6, 'days').format(FORMAT_YEAR_MONTH_DAY)
    let excludeEstimates = false
    const events = <Array<any>>await this.casesService.getEventsByDate(startDate, endDate, excludeEstimates)
    return events
  }

  async render(caseEvents:Array<CaseEvent>) {
    // Get an array of unique cases found related to the events.
    const userDb = await this.userService.getUserDatabase(this.userService.getCurrentUser())
    const cases:Array<TangyFormResponse> = []
    const uniqueCaseIds = caseEvents.reduce((uniqueCaseIds, caseEventInstance) => {
      return uniqueCaseIds.indexOf(caseEventInstance.caseId) === -1
        ? [...uniqueCaseIds, caseEventInstance.caseId]
        : uniqueCaseIds
    }, [])
    for (const caseId of uniqueCaseIds) {
      cases.push(await userDb.get(caseId))
    }
    // Keept track of days of week seen. When we detect a new day, add a dateLabel and dateNumber.
    let daysOfWeekSeen = []
    // Iterate over the caseEvents collecting their infos for templating.
    const caseEventInfos =  []
    for (let caseEventInstance of caseEvents) {
      // Build up caseEventInfo to push into caseEventInfos.
      const caseEventInfo = <CaseEventInfo>{}
      // Determine a date this event will rest on.
      const date = caseEventInstance.occurredOnDay || caseEventInstance.scheduledDay || caseEventInstance.estimatedDay || caseEventInstance.windowStartDay
      // If this is a day of the week we have not seen, then attach a date label to this entry in the list.
      if (daysOfWeekSeen.indexOf(date) === -1) {
        daysOfWeekSeen.push(date)
        caseEventInfo.dateLabel = moment(date).format('ddd')
        caseEventInfo.dateNumber = this.mode === CASE_EVENT_SCHEDULE_LIST_MODE_WEEKLY 
          ? moment(date).format('D') 
          : ``
      }
      // Determine the link to use when opening this event.
      caseEventInfo.openLink = `/case/event/${caseEventInstance.caseId}/${caseEventInstance.id}`
      // Gather some variables to be available for the templates.
      const caseService = this.caseService
      await caseService.load(caseEventInstance.caseId)
      const caseDefinition = caseService.caseDefinition 
      const caseEventDefinition = caseDefinition.eventDefinitions.find(({id}) => id === caseEventInstance.caseEventDefinitionId)
      const caseInstance = caseService.case
      const caseEvent = caseEventInstance
      // Provide default templates in case they are not provided in the CaseDefinition. 
      const defaultTemplateScheduleListItemIcon = '${caseEventInfo.status === \'CASE_EVENT_STATUS_COMPLETED\' ? \'event_note\' : \'event_available\'}'
      const defaultTemplateScheduleListItemPrimary = '<span>${caseEventDefinition.name}</span> in Case ${caseService.case._id.substr(0,5)}'
      const defaultTemplateScheduleListItemSecondary = '<span>${caseInstance.label}</span>'
      // Template the event markup.
      eval(`caseEventInfo.scheduleListItemIcon = caseDefinition.templateScheduleListItemIcon ? \`${caseDefinition.templateScheduleListItemIcon}\` : \`${defaultTemplateScheduleListItemIcon}\``)
      eval(`caseEventInfo.scheduleListItemPrimary = caseDefinition.templateScheduleListItemPrimary ? \`${caseDefinition.templateScheduleListItemPrimary}\` : \`${defaultTemplateScheduleListItemPrimary}\``)
      eval(`caseEventInfo.scheduleListItemSecondary = caseDefinition.templateScheduleListItemSecondary ? \`${caseDefinition.templateScheduleListItemSecondary}\` : \`${defaultTemplateScheduleListItemSecondary}\``)
      // Done.
      caseEventInfos.push(caseEventInfo)
    }
    // Render the Angular Template.
    this.caseEventInfos = caseEventInfos
    this.ref.detectChanges()
    this.didSearch$.next(true)
  }




}
