import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { UserService } from 'src/app/shared/_services/user.service';
import { CasesService } from 'src/app/case/services/cases.service';
import * as moment from 'moment'
import { FORM_TYPES_INFO } from 'src/app/core/search/search.component';
import {  CASE_EVENT_STATUS_COMPLETED } from 'src/app/case/classes/case-event.class';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { TangyFormResponse } from 'src/app/tangy-forms/tangy-form-response.class';
import { SearchDoc, SearchService } from 'src/app/shared/_services/search.service';
import { FormInfo } from 'src/app/tangy-forms/classes/form-info.class';
import { Subject } from 'rxjs';
import { CaseService } from 'src/app/case/services/case.service';
import { CaseEventInfo } from 'src/app/case/services/case-event-info.class';
import { CaseDefinition } from 'src/app/case/classes/case-definition.class';

export const CASE_EVENT_SCHEDULE_LIST_MODE_DAILY = 'CASE_EVENT_SCHEDULE_LIST_MODE_DAILY'
export const CASE_EVENT_SCHEDULE_LIST_MODE_WEEKLY = 'CASE_EVENT_SCHEDULE_LIST_MODE_WEEKLY'

class EventInfo {
  newDateNumber = ''
  newDateLabel = ''
  openLink = ''
  icon = ''
  primary = ''
  secondary = ''
  caseDefinition: CaseDefinition
}

@Component({
  selector: 'app-case-event-schedule-list',
  templateUrl: './case-event-schedule-list.component.html',
  styleUrls: ['./case-event-schedule-list.component.css']
})
export class CaseEventScheduleListComponent implements OnInit {

  formTypesInfo = FORM_TYPES_INFO
  eventsInfo:Array<EventInfo> = []
  formsInfo:Array<FormInfo>
  didSearch$ = new Subject()

  private _date = Date.now()
  @Input()
  set date(date:number) {
    this._date = date;
    // this.calculateEvents()
      ( async (name) => {
        await this.calculateEvents()
      })();
  }

  private _mode = CASE_EVENT_SCHEDULE_LIST_MODE_WEEKLY
  @Input()
  set mode(mode:string) {
    if (this._mode === mode) {
      return;
    }
    this._mode = mode;
    //   await this.calculateEvents()
     ( async (name) => {
      await this.calculateEvents()
    })();
  }

  constructor(
    private casesService:CasesService,
    private userService:UserService,
    private searchService:SearchService,
    private formsInfoService:TangyFormsInfoService,
    private caseService:CaseService,
    private ref: ChangeDetectorRef
  ) {
    ref.detach()
  }

  async ngOnInit() {
  }

  async calculateEvents() {
    let startDate = Date.now()
    let endDate = Date.now()
    let excludeEstimates = false
    const d = new Date(this._date)
    /**
     * The date widget gets the unix representation of the time at the date and time of selecting the date.
     * Thus we change the date we get to YYYY-MM-DD so as to get the unix milliseconds representation of the date.
     * We do not want the time part of the date as it will lead to subtle errors(off by one)
     * We are only interested in the YYYY-MM-DD of the date.
     */
    const _date = [ d.getFullYear(), ('0' + (d.getMonth() + 1)).slice(-2), ('0' + d.getDate()).slice(-2)].join('-')
    if (this._mode === CASE_EVENT_SCHEDULE_LIST_MODE_DAILY) {
      startDate = new Date(_date).getTime()
      endDate = startDate + (1000*60*60*24)
      excludeEstimates = false
    } else if (this._mode === CASE_EVENT_SCHEDULE_LIST_MODE_WEEKLY) {
      const beginningOfWeek = moment(moment(new Date(_date)).format('YYYY w'), 'YYYY w').unix()*1000
      const endOfWeek = beginningOfWeek + (1000*60*60*24*7)
      startDate = beginningOfWeek
      endDate = endOfWeek
      excludeEstimates = false
    }
    const events = await this.casesService.getEventsByDate(startDate, endDate, excludeEstimates)
    await this.render(events)
  }

  async render(events:Array<CaseEventInfo>) {
    // Get some data together before rendering.
    const userDb = await this.userService.getUserDatabase(this.userService.getCurrentUser())
    const searchDocs:Array<SearchDoc> = []
    const responses:Array<TangyFormResponse> = []
    const caseIds = events.reduce((caseIds, caseEventInfo) => caseIds.indexOf(caseEventInfo.caseId) === -1 ? [...caseIds, caseEventInfo.caseId] : caseIds, [])
    for (const caseId of caseIds) {
      searchDocs.push(await this.searchService.getIndexedDoc(this.userService.getCurrentUser(), caseId))
      responses.push(await userDb.get(caseId))
    }
    const formsInfo = await this.formsInfoService.getFormsInfo()
    // Render.
    let markup = ``
    let daysOfWeekSeen = []
    this.eventsInfo = events.map( event => {
      const eventInfo = <EventInfo>{}
      const searchDate = event.occurredOnDay || event.scheduledDay || event.estimatedDay || event.windowStartDay
      const date = new Date(searchDate)
      if (daysOfWeekSeen.indexOf(date.getDate()) === -1) {
        daysOfWeekSeen.push(date.getDate())
        eventInfo.newDateLabel = moment(date).format('ddd')
        eventInfo.newDateNumber = this._mode === CASE_EVENT_SCHEDULE_LIST_MODE_WEEKLY
          ? date.getDate().toString()
          : ``
      }
      const searchDoc = searchDocs.find(searchDoc => searchDoc._id === event.caseId)
      const response = responses.find(response => response._id === event.caseId)
      const formTypeInfo = FORM_TYPES_INFO.find(formTypeInfo => formTypeInfo.id === searchDoc.formType)
      const formInfo = formsInfo.find(formInfo => formInfo.id === searchDoc.formId)
      const formId = formInfo.id
      eventInfo.openLink = `/case/event/${searchDoc._id}/${event.id}`
      eventInfo.icon = eval('`' + formTypeInfo.iconTemplate + '`')
      eventInfo.primary = formInfo.searchSettings.primaryTemplate ? eval('`' + formInfo.searchSettings.primaryTemplate + '`') : response._id
      eventInfo.secondary = formInfo.searchSettings.secondaryTemplate ? eval('`' + formInfo.searchSettings.secondaryTemplate + '`') : formInfo.title
      eventInfo.caseDefinition = this.getCaseDefinition(event)
      return eventInfo
    })
    // console.log('dude')
    this.ref.detectChanges()
    this.didSearch$.next(true)
  }

    getCaseDefinition(caseEventInfo:CaseEventInfo){
      if(!caseEventInfo.caseDefinition) return
    let templateScheduleListItemIcon, templateScheduleListItemPrimary,templateScheduleListItemSecondary,caseEventDefinition;
    const caseDefinition = caseEventInfo.caseDefinition;
    caseEventDefinition = caseDefinition.eventDefinitions.find(({id}) => id === caseEventInfo.caseEventDefinitionId)
    const caseInstance = caseEventInfo.caseInstance;
    const defaultTemplateScheduleListItemIcon = `${caseEventInfo.status === CASE_EVENT_STATUS_COMPLETED ? 'event_note' : 'event_available'}`
    const defaultTemplateScheduleListItemPrimary = '<span>${caseEventDefinition.name}</span>'
    const defaultTemplateScheduleListItemSecondary = '<span>${caseInstance.label}</span>'
    eval(`templateScheduleListItemIcon = caseDefinition.templateScheduleListItemIcon ? \`${caseDefinition.templateScheduleListItemIcon}\` : \`${defaultTemplateScheduleListItemIcon}\``)
    eval(`templateScheduleListItemPrimary = caseDefinition.templateScheduleListItemPrimary ? \`${caseDefinition.templateScheduleListItemPrimary}\` : \`${defaultTemplateScheduleListItemPrimary}\``)
    eval(`templateScheduleListItemSecondary = caseDefinition.templateScheduleListItemSecondary ? \`${caseDefinition.templateScheduleListItemSecondary}\` : \`${defaultTemplateScheduleListItemSecondary}\``)
    return {
      ...caseDefinition,
      templateScheduleListItemIcon,
      templateScheduleListItemPrimary,
      templateScheduleListItemSecondary
    }

  }

}
