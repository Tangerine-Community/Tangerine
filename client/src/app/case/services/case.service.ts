import { EventFormDefinition } from './../classes/event-form-definition.class';
import { Subject } from 'rxjs';
import { NotificationStatus, Notification, NotificationType } from './../classes/notification.class';
import { Issue, IssueStatus, IssueEvent, IssueEventType } from './../classes/issue.class';
// Services.
import { DeviceService } from 'src/app/device/services/device.service';
import { TangyFormService } from 'src/app/tangy-forms/tangy-form.service';
import { CaseDefinitionsService } from './case-definitions.service';
import { HttpClient } from '@angular/common/http';
// Classes.
import { TangyFormResponseModel } from 'tangy-form/tangy-form-response-model.js';
import { Case } from '../classes/case.class'
import { CaseEvent } from '../classes/case-event.class'
import { EventForm } from '../classes/event-form.class'
import { CaseDefinition } from '../classes/case-definition.class';
import { CaseParticipant } from '../classes/case-participant.class';
import { Query } from '../classes/query.class'
// Other.
import { v4 as UUID } from 'uuid';
import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { AppContext } from 'src/app/app-context.enum';
import { CaseEventDefinition } from '../classes/case-event-definition.class';
import {Conflict} from "../classes/conflict.class";

@Injectable({
  providedIn: 'root'
})
class CaseService {

  _case:Case
  caseDefinition:CaseDefinition

  // Opening a case confirmation semaphore.
  openCaseConfirmed = false
  // Query properties.
  queryCaseEventDefinitionId: any
  queryEventFormDefinitionId: any
  queryFormId: any
  _shouldSave = true

  set case(caseInstance:Case) {
    const caseInfo:CaseInfo = {
      caseInstance,
      caseDefinition: this.caseDefinition
    }
    this._case = markQualifyingCaseAsComplete(markQualifyingEventsAsComplete(caseInfo)).caseInstance
  }

  get case():Case {
    return this._case
  }

  caseEvent:CaseEvent
  caseEventDefinition:CaseEventDefinition
  eventForm:EventForm
  eventFormDefinition:EventFormDefinition
  participant:CaseParticipant

  setContext(caseEventId = '', eventFormId = '') {
    window['caseInstance'] = this.case
    this.caseEvent = caseEventId
      ? this.case
        .events
        .find(caseEvent => caseEvent.id === caseEventId)
      : null
    window['caseEvent'] = this.caseEvent
    this.caseEventDefinition = caseEventId
      ? this
        .caseDefinition
        .eventDefinitions
        .find(caseEventDefinition => caseEventDefinition.id === this.caseEvent.caseEventDefinitionId)
      : null
    window['caseEventDefinition'] = this.caseEventDefinition
    this.eventForm = eventFormId
      ? this.caseEvent
        .eventForms
        .find(eventForm => eventForm.id === eventFormId)
      : null
    window['eventForm'] = this.eventForm
    this.eventFormDefinition = eventFormId
      ? this.caseEventDefinition
        .eventFormDefinitions
        .find(eventFormDefinition => eventFormDefinition.id === this.eventForm.eventFormDefinitionId)
      : null
    this.participant = this.eventForm
      ? this.case.participants.find(participant => participant.id === this.eventForm.participantId)
      : null
    window['participant'] = this.participant
  }

  getCurrentCaseEventId() {
    return this?.caseEvent?.id
  }
  
  getCurrentEventFormId() {
    return this?.eventForm?.id
  }

  constructor(
    private tangyFormService: TangyFormService,
    private caseDefinitionsService: CaseDefinitionsService,
    private deviceService:DeviceService,
    private http:HttpClient
  ) {
    this.queryCaseEventDefinitionId = 'query-event';
    this.queryEventFormDefinitionId = 'query-form-event';
    this.queryFormId = 'query-form';
  }

  /*
   * Case API
   */

  get id() {
    return this._case._id
  }

  get participants() {
    return this._case.participants || []
  }

  get events() {
    return this._case.events || []
  }

  get forms() {
    return this._case.events.reduce((forms, event) => {
      return [
        ...event.eventForms || [],
        ...forms
      ]
    }, [])
  }

  get roleDefinitions() {
    return this.caseDefinition.caseRoles
  }

  get caseEventDefinitions() {
    return this.caseDefinition.eventDefinitions || []
  }

  get eventFormDefinitions() {
    return this.caseDefinition.eventDefinitions.reduce((formDefs, eventDef) => {
      return [
        ...eventDef.eventFormDefinitions.map(eventFormDef => {
          return {
            ...eventFormDef,
            eventDefinitionId: eventDef.id
          }
        }) || [],
        ...formDefs
      ]
    }, [])
  }

  async create(caseDefinitionId) {
    this.caseDefinition = <CaseDefinition>(await this.caseDefinitionsService.load())
      .find(caseDefinition => caseDefinition.id === caseDefinitionId)
    this.case = new Case({caseDefinitionId, events: [], _id: UUID()})
    delete this.case._rev
    const tangyFormContainerEl:any = document.createElement('div')
    tangyFormContainerEl.innerHTML = await this.tangyFormService.getFormMarkup(this.caseDefinition.formId, null)
    const tangyFormEl = tangyFormContainerEl.querySelector('tangy-form')
    tangyFormEl.style.display = 'none'
    document.body.appendChild(tangyFormContainerEl)
    try {
      const device = await this.deviceService.getDevice()
      this.case.location = device.assignedLocation?.value.reduce((location, levelInfo) => { return {...location, [levelInfo.level]: levelInfo.value}}, {})
    } catch(error) {
      console.log("There was error setting the location on the case.")
      console.log(error)
    }
    this.case.form = tangyFormEl.getProps()
    this.case.items = []
    tangyFormEl.querySelectorAll('tangy-form-item').forEach((item) => {
      this.case.items.push(item.getProps())
    })
    tangyFormEl.querySelectorAll('tangy-form-item')[0].submit()
    this.case.items[0].inputs = tangyFormEl.querySelectorAll('tangy-form-item')[0].inputs
    tangyFormEl.response = this.case
    this.case = {...this.case, ...tangyFormEl.response}
    tangyFormContainerEl.remove()
    await this.setCase(this.case)
    this.case.caseDefinitionId = caseDefinitionId;
    if (this.caseDefinition.startFormOnOpen && this.caseDefinition.startFormOnOpen.eventFormId) {
      const caseEvent = this.createEvent(this.caseDefinition.startFormOnOpen.eventId)
      this.createEventForm(caseEvent.id, this.caseDefinition.startFormOnOpen.eventFormId) 
    }
    await this.save()
  }

  
  async setCase(caseInstance) {
    // Note the order of setting caseDefinition before case matters because the setter for case expects caseDefinition to be the current one.
    this.caseDefinition = (await this.caseDefinitionsService.load())
      .find(caseDefinition => caseDefinition.id === caseInstance.caseDefinitionId)
    this.case = caseInstance
  }

  async load(id:string) {
    await this.setCase(new Case(await this.tangyFormService.getResponse(id)))
    this._shouldSave = true 
  }


  async loadInMemory(caseData:Case) {
    await this.setCase(new Case(caseData))
    this._shouldSave = false
  }

  onChangeLocation$ = new Subject()

  // @Param location: Can be Object where keys are levels and values are IDs of locations or an Array from the Tangy Location input's value.
  async changeLocation(location:any):Promise<void> {
    location = Array.isArray(location)
      ? location.reduce((location, level) => { return {...location, [level.level]: level.value} }, {})
      : location
    this.case.location = location
    const eventForms:Array<EventForm> = this.case.events
      .reduce((eventForms, event) => {
        return [...eventForms, ...event.eventForms]
      }, [])
    for (let eventForm of eventForms) {
      if (eventForm.formResponseId) {
        const response = await this.tangyFormService.getResponse(eventForm.formResponseId)
        response.location = location
        await this.tangyFormService.saveResponse(response)
      }
    }
    this.onChangeLocation$.next(location)
  }

  async getCaseDefinitionByID(id:string) {
    return <CaseDefinition>await this.http.get(`./assets/${id}.json`)
      .toPromise()
  }

  async save() {
    if (this._shouldSave) {
      await this.tangyFormService.saveResponse(this.case)
      await this.setCase(await this.tangyFormService.getResponse(this.case._id))
    }
  }

  setVariable(variableName, value) {
    let input = this.case.items[0].inputs.find(input => input.name === variableName)
    if (input) {
      input.value = value
    } else {
      this.case.items[0].inputs.push({name: variableName, value: value})
    }
  }

  getVariable(variableName) {
    return this.case.items[0].inputs.find(input => input.name === variableName)
      ? this.case.items[0].inputs.find(input => input.name === variableName).value
      : undefined
  }

  /*
   * Case Event API
   */

  createEvent(eventDefinitionId:string): CaseEvent {
    const caseEventDefinition = this.caseDefinition
      .eventDefinitions
      .find(eventDefinition => eventDefinition.id === eventDefinitionId)
    const caseEvent = <CaseEvent>{
      id: UUID(),
      caseId: this.case._id,
      name: caseEventDefinition.name,
      complete: false,
      estimate: true,
      caseEventDefinitionId: eventDefinitionId,
      windowEndDay: undefined,
      windowStartDay: undefined,
      estimatedDay: undefined,
      occurredOnDay: undefined,
      scheduledDay: undefined,
      eventForms: [],
      startDate: 0
    }
    this.case.events.push(caseEvent)
    for (const caseParticipant of this.case.participants) {
      for (const eventFormDefinition of caseEventDefinition.eventFormDefinitions) {
        if (
          caseParticipant.caseRoleId === eventFormDefinition.forCaseRole && 
          (
            eventFormDefinition.autoPopulate || 
            (eventFormDefinition.autoPopulate === undefined && eventFormDefinition.required === true)
          )
        ) {
          this.createEventForm(caseEvent.id, eventFormDefinition.id, caseParticipant.id)
        }
      }
    }
    return caseEvent
  }

  setEventEstimatedDay(eventId, timeInMs: number) {
    const estimatedDay = moment((new Date(timeInMs))).format('YYYY-MM-DD')
    this.case.events = this.case.events.map(event => {
      return event.id === eventId
        ? { ...event, ...{ estimatedDay } }
        : event
    })
  }
  setEventScheduledDay(eventId, timeInMs: number) {
    const scheduledDay = moment((new Date(timeInMs))).format('YYYY-MM-DD')
    this.case.events = this.case.events.map(event => {
      return event.id === eventId
        ? { ...event, ...{ scheduledDay } }
        : event
    })
  }
  setEventWindow(eventId: string, windowStartDayTimeInMs: number, windowEndDayTimeInMs: number) {
    const windowStartDay = moment((new Date(windowStartDayTimeInMs))).format('YYYY-MM-DD')
    const windowEndDay = moment((new Date(windowEndDayTimeInMs))).format('YYYY-MM-DD')
    this.case.events = this.case.events.map(event => {
      return event.id === eventId
        ? { ...event, ...{ windowStartDay, windowEndDay } }
        : event
    })
  }
  setEventOccurredOn(eventId, timeInMs: number) {
    const occurredOnDay = moment((new Date(timeInMs))).format('YYYY-MM-DD')
    return this.case.events = this.case.events.map(event => {
      return event.id === eventId
        ? { ...event, ...{ occurredOnDay } }
        : event
    })
  }

  disableEventDefinition(eventDefinitionId) {
    if (this.case.disabledEventDefinitionIds.indexOf(eventDefinitionId) === -1) {
      this.case.disabledEventDefinitionIds.push(eventDefinitionId)
    }
  }

  /*
   * Event Form API
   */

  createEventForm(caseEventId, eventFormDefinitionId, participantId = ''): EventForm {
    const caseEvent = this.case.events.find(event => event.id === caseEventId)
    const eventFormId = UUID()
    this.case = {
      ...this.case,
      events: this.case.events.map(event => event.id === caseEventId
        ? {
            ...event,
            eventForms: [
              ...event.eventForms,
              <EventForm>{
                id: eventFormId,
                complete: false,
                required: this
                  .caseDefinition
                  .eventDefinitions
                  .find(eventDefinition => eventDefinition.id === caseEvent.caseEventDefinitionId)
                  .eventFormDefinitions
                  .find(eventFormDefinition => eventFormDefinition.id === eventFormDefinitionId)
                  .required,
                caseId: this.case._id,
                participantId,
                caseEventId,
                eventFormDefinitionId
              }
            ]
        }
        : event
      )
    }
    return this.case
      .events
      .find(event => event.id === caseEvent.id)
      .eventForms
      .find(eventForm => eventForm.id === eventFormId)
  }

  // @TODO Deprecated.
  startEventForm(caseEventId, eventFormDefinitionId, participantId = ''): EventForm {
    console.warn('caseService.startEventForm(...) is deprecated. Please use caseService.createEventForm(...) before startEventForm is removed.')
    return this.createEventForm(caseEventId, eventFormDefinitionId, participantId)
  }

  deleteEventForm(caseEventId: string, eventFormId: string) {
    this.case = {
      ...this.case,
      events: this.case.events.map(event => {
        return {
          ...event,
          eventForms: event.id === caseEventId
            ? event.eventForms.filter(eventForm => eventForm.id !== eventFormId)
            : event.eventForms
        }
      })
    }
  }

  setEventFormData(caseEventId:string,eventFormId:string, key:string, value:string) {
    const index = this
    .case
    .events
    .find(caseEvent => caseEvent.id === caseEventId)
    .eventForms.findIndex(eventForm => eventForm.id === eventFormId);
    this
    .case
    .events
    .find(caseEvent => caseEvent.id === caseEventId).eventForms[index].data = {
      ...this
      .case
      .events
      .find(caseEvent => caseEvent.id === caseEventId).eventForms[index].data, [key]:value};
  }

  getEventFormData(caseEventId:string,eventFormId:string, key:string,) {
    const index = this
    .case
    .events
    .find(caseEvent => caseEvent.id === caseEventId)
    .eventForms.findIndex(eventForm => eventForm.id === eventFormId);
   return this
    .case
    .events
    .find(caseEvent => caseEvent.id === caseEventId).eventForms[index].data[key] || ''
  }

  markEventFormRequired(caseEventId:string, eventFormId:string) {
    this.case = {
      ...this.case,
      events: this.case.events.map(event => event.id !== caseEventId
        ? event
        : {
          ...event,
          eventForms: event.eventForms.map(eventForm => eventForm.id !== eventFormId
            ? eventForm
            : {
              ...eventForm,
              required: true
            }
          )
        }
      )
    }
  }

  markEventFormNotRequired(caseEventId:string, eventFormId:string) {
    this.case = {
      ...this.case,
      events: this.case.events.map(event => event.id !== caseEventId
        ? event
        : {
          ...event,
          eventForms: event.eventForms.map(eventForm => eventForm.id !== eventFormId
            ? eventForm
            : {
              ...eventForm,
              required: false
            }
          )
        }
      )
    }
  }

  markEventFormComplete(caseEventId:string, eventFormId:string) {
    this.case = {
      ...this.case,
      events: this.case.events.map(event => event.id !== caseEventId
        ? event
        : {
          ...event,
          eventForms: event.eventForms.map(eventForm => eventForm.id !== eventFormId
            ? eventForm
            : {
              ...eventForm,
              complete: true
            }
          )
        }
      )
    }
  }

  /*
   * Participant API
   */

  createParticipant(caseRoleId = ''):CaseParticipant {
    const id = UUID()
    const data = {}
    const caseParticipant = <CaseParticipant>{
      id,
      caseRoleId,
      data
    }
    this.case.participants.push(caseParticipant)
    for (let caseEvent of this.case.events) {
      const caseEventDefinition = this
        .caseDefinition
        .eventDefinitions
        .find(eventDefinition => eventDefinition.id === caseEvent.caseEventDefinitionId)
      for (let eventFormDefinition of caseEventDefinition.eventFormDefinitions) {
        if (
          caseRoleId === eventFormDefinition.forCaseRole && 
          (
            eventFormDefinition.autoPopulate || 
            (eventFormDefinition.autoPopulate === undefined && eventFormDefinition.required === true)
          )
        ) {
          this.createEventForm(caseEvent.id, eventFormDefinition.id, caseParticipant.id)
        }
      }
    }
    return caseParticipant
  }

  setParticipantData(participantId:string, key:string, value:string) {
    const index = this.case.participants.findIndex(participant => participant.id === participantId)
    this.case.participants[index].data[key] = value
  }

  getParticipantData(participantId:string, key:string) {
    return this.case.participants.find(participant => participant.id === participantId).data[key]
  }

  /*
   * Notification API
   */

  createNotification (label = '', description = '', link = '', icon = 'notification_important', color = '#CCC', persist = false, enforceAttention = false ) {
    const notification = <Notification>{
      id: UUID(),
      status: NotificationStatus.Open,
      createdAppContext: AppContext.Client,
      createdOn: Date.now(),
      label,
      description,
      link,
      icon,
      color,
      enforceAttention,
      persist
   }
    this.case.notifications.push(notification)
  }

  async openNotification(notificationId:string) {
    this.case.notifications = this.case.notifications.map(notification => {
      return notification.id === notificationId
        ? <Notification>{
          ...notification,
          status: NotificationStatus.Open
        }
        : notification
    })
  }

  async closeNotification(notificationId:string) {
    this.case.notifications = this.case.notifications.map(notification => {
      return notification.id === notificationId
        ? <Notification>{
          ...notification,
          status: NotificationStatus.Closed
        }
        : notification
    })
  }

  /*
   * Issues API.
   * If the issue is a formResponse, the eventId will be available.
   * If the issue is a case or other type, createIssue will get the type from metadata.docType
   * and use it to populate docType in the Issue it creates.
   */
  
  async createIssue (label = '', comment = '', caseId:string, eventId:string, eventFormId:string, userId, userName, resolveOnAppContexts:Array<AppContext> = [AppContext.Editor], conflict: any = null) {

    const caseData = await this.tangyFormService.getResponse(caseId)
    let formResponseId, docType
    if (eventId) {
      formResponseId = caseData
        .events.find(event => event.id === eventId)
        .eventForms.find(eventForm => eventForm.id === eventFormId)
        .formResponseId
    }
    if (conflict) {
      docType = conflict.docType
    } else {
      docType = 'response'
    }

    const issue = new Issue({
      _id: UUID(),
      label,
      location: caseData.location,
      caseId,
      createdOn: Date.now(),
      createdAppContext: AppContext.Client,
      resolveOnAppContexts,
      eventId,
      eventFormId,
      status: IssueStatus.Open,
      formResponseId,
      docType
    })
    await this.tangyFormService.saveResponse(issue)
    return await this.openIssue(issue._id, comment, userId, userName, conflict)
  }

  async getIssue(issueId) {
    return new Issue(await this.tangyFormService.getResponse(issueId))
  }

  /**
   * Creates an IssueEvent with the formResponse in the data object if 'response' caseInstance if 'case'
   * @param issueId
   * @param comment
   * @param userId
   * @param userName
   * @param conflict
   */
  async openIssue(issueId: string, comment: string, userId: string, userName: string, conflict: Conflict = null) {
    const issue = new Issue(await this.tangyFormService.getResponse(issueId))
    const caseInstance = await this.tangyFormService.getResponse(issue.caseId)
    const response = issue.formResponseId ? await this.tangyFormService.getResponse(issue.formResponseId) : caseInstance
    const docType = issue.docType ? issue.docType : 'response'

    issue.events.push(<IssueEvent>{
      id: UUID(),
      type: IssueEventType.Open,
      date: Date.now(),
      userName,
      userId,
      createdAppContext: AppContext.Client,
      docType,
      data: {
        comment,
        caseInstance,
        response,
        conflict
      }
    })
    return await this.tangyFormService.saveResponse({
      ...issue,
      status: IssueStatus.Open
    })
  }

  async closeIssue(issueId:string, comment:string, userId:string, userName:string) {
    const issue = new Issue(await this.tangyFormService.getResponse(issueId))
    issue.events.push(<IssueEvent>{
      id: UUID(),
      type: IssueEventType.Close,
      date: Date.now(),
      userName,
      userId,
      createdAppContext: AppContext.Client,
      data: {
        comment
      }
    })
    return await this.tangyFormService.saveResponse({
      ...issue,
      status: IssueStatus.Closed
    })
  }

  async rebaseIssue(issueId:string, userId:string, userName:string) {
    const issue = new Issue(await this.tangyFormService.getResponse(issueId))
    const caseInstance = await this.tangyFormService.getResponse(issue.caseId)
    const response = await this.tangyFormService.getResponse(issue.formResponseId)
    issue.events.push(<IssueEvent>{
      id: UUID(),
      type: IssueEventType.Rebase,
      date: Date.now(),
      userName,
      userId,
      createdAppContext: AppContext.Editor,
      data: {
        caseInstance,
        response 
      }
    })
    return await this.tangyFormService.saveResponse({
      ...issue,
      status: IssueStatus.Open
    })
  }


  async commentOnIssue(issueId, comment, userId, userName) {
    const issue = <Issue>await this.tangyFormService.getResponse(issueId)
    issue.events.push(<IssueEvent>{
      id: UUID(),
      type: IssueEventType.Comment,
      userName,
      createdAppContext: AppContext.Client,
      date: Date.now(),
      userId,
      data: {
        comment
      }
    })
    return await this.tangyFormService.saveResponse(issue)
  }

  async getProposedChange(issueId) {
    const issue = new Issue(await this.tangyFormService.getResponse(issueId))
    const lastProposedChangeEvent = [...issue.events]
      .reverse()
      .find(event => event.type === IssueEventType.ProposedChange)
    if (!lastProposedChangeEvent) {
      return {
        response: await this.tangyFormService.getResponse(issue.formResponseId),
        caseInstance: await this.tangyFormService.getResponse(issue.caseId)
      }
    } else {
      return lastProposedChangeEvent.data
    }
  }

  async saveProposedChange(response, caseInstance, issueId, userId, userName) {
    const issue = <Issue>await this.tangyFormService.getResponse(issueId)
    const currentProposedChange = await this.getProposedChange(issueId)
    issue.events.push(<IssueEvent>{
      id: UUID(),
      type: IssueEventType.ProposedChange,
      userName,
      createdAppContext: AppContext.Client,
      date: Date.now(),
      userId,
      data: {
        diff: this.diffFormResponses(currentProposedChange.response, response),
        response,
        caseInstance
      }
    })
    return await this.tangyFormService.saveResponse(issue)
  }

  async mergeProposedChange(issueId:string, userId:string, userName:string) {
    const issue = new Issue(await this.tangyFormService.getResponse(issueId))
    issue.events.push(<IssueEvent>{
      id: UUID(),
      type: IssueEventType.Merge,
      date: Date.now(),
      createdAppContext: AppContext.Client,
      userName,
      userId
    })
    const proposedFormResponse = await this.getProposedChange(issueId)
    this.tangyFormService.saveResponse(proposedFormResponse.response)
    this.tangyFormService.saveResponse(proposedFormResponse.case)
    return await this.tangyFormService.saveResponse({
      ...issue,
      status: IssueStatus.Merged
    })
  }

  async hasProposedChange(issueId:string) {
    const issue = new Issue(await this.tangyFormService.getResponse(issueId))
    return !!issue.events.find(event => event.type === IssueEventType.ProposedChange)
  }

  async canMergeProposedChange(issueId:string) {
    const issue = new Issue(await this.tangyFormService.getResponse(issueId))
    const firstOpenEvent = issue.events.find(event => event.type === IssueEventType.Open)
    const currentFormResponse = await this.tangyFormService.getResponse(issue.formResponseId)
    const currentCaseInstance = await this.tangyFormService.getResponse(issue.caseId)
    return currentFormResponse._rev === firstOpenEvent.data.response._rev && currentCaseInstance._rev === firstOpenEvent.data.caseInstance._rev ? true : false
  }

  async issueDiff(issueId) {
    const issue = new Issue(await this.tangyFormService.getResponse(issueId))
    const firstOpenEvent = issue.events.find(event => event.type === IssueEventType.Open)
    const lastProposedChangeEvent = [...issue.events].reverse().find(event => event.type === IssueEventType.ProposedChange)
    return lastProposedChangeEvent
      ? this.diffFormResponses(firstOpenEvent.data.response, lastProposedChangeEvent.data.response)
      : []
  }

  diffFormResponses(a, b) {
    const A = new TangyFormResponseModel(a)
    const B = new TangyFormResponseModel(b)
    const diff = A.inputs.reduce((diff, input) => {
      if (B.inputsByName[input.name]) {
        return JSON.stringify(input.value) !== JSON.stringify(B.inputsByName[input.name].value)
          ? [
            ...diff,
            {
              name: input.name,
              a: A.inputsByName[input.name],
              b: B.inputsByName[input.name]
            }
          ]
          : diff
      } else {
        return [
          ...diff,
          {
            name: input.name,
            error: 'Missing input',
            a: A.inputsByName[input.name],
            b: B.inputsByName[input.name]
          }
        ]
      }

    }, [])
    return diff
  }

  /*
   * Data Inquiries API
   */

  async getQueries (): Promise<Array<Query>> {
    const queryForms = await this.tangyFormService.getResponsesByFormId(this.queryFormId);
    const queries = Array<Query>();
    for (const queryForm of queryForms) {
      const query = Object.create(Query);
      queryForm.items[0].inputs.map(q => (query[q.name] = q.value));
      if (query.queryStatus === 'Open') {
        queries.push(query);
      }
    }
    return queries;
  }

  async getOpenQueriesCount (): Promise<number> {
    return (await this.getQueries()).length;
  }

  async createQuery (
    { caseId, eventId, formId, formName, formTitle, participantId, variableName, queryType, queryDate, queryText }
      ): Promise<string> {
    caseId = this.case._id;
    let caseEvent = this.case.events
      .find(caseEventInfo => caseEventInfo.caseEventDefinitionId === this.queryCaseEventDefinitionId);

    if (caseEvent === undefined) {
        const newDate = moment(new Date(), 'YYYY-MM-DD').unix() * 1000;
        caseEvent = this.createEvent(this.queryCaseEventDefinitionId);
        await this.save();
      } else {
        caseEvent = this.case.events
        .find(caseEventInfo => caseEventInfo.caseEventDefinitionId === this.queryCaseEventDefinitionId);
      }

      const c = this.createEventForm(caseEvent.id, this.queryEventFormDefinitionId);
      await this.save();

      caseEvent = this.case.events.find(c => c.caseEventDefinitionId === this.queryCaseEventDefinitionId);
      const eventForm = caseEvent.eventForms.find(d => d.id === c.id);

      const formLink = '/case/event/form/' + caseId + '/' + eventId + '/' + formId;
      const queryLink = '/case/event/form/' + caseId + '/' + caseEvent.id + '/' + eventForm.id;

      const tangyFormContainerEl:any = document.createElement('div');
      tangyFormContainerEl.innerHTML = await this.tangyFormService.getFormMarkup(this.queryFormId, null);
      const tangyFormEl = tangyFormContainerEl.querySelector('tangy-form') ;
      tangyFormEl.style.display = 'none';
      document.body.appendChild(tangyFormContainerEl);

      tangyFormEl.newResponse();

      tangyFormEl.response.items[0].inputs = [
        { name: 'associatedCaseType', value: this.case.caseDefinitionId },
        { name: 'associatedCaseId', value: caseId },
        { name: 'associatedEventId', value: eventId },
        { name: 'associatedFormId', value: formId },
        { name: 'associatedCaseName', value: participantId },
        { name: 'associatedFormName', value: formTitle },
        { name: 'associatedFormLink', value: formLink },
        { name: 'associatedVariable', value: variableName },
        { name: 'queryText', value: queryText },
        { name: 'queryId', value: 'N/A' },
        { name: 'queryDate', value: queryDate },
        { name: 'queryTypeId', value: queryType },
        { name: 'queryResponse', value: '' },
        { name: 'queryResponseDate', value: '' },
        { name: 'queryStatus', value: 'Open' },
        { name: 'queryLink', value: queryLink }
      ];

      //tangyFormEl.store.dispatch({ type: 'FORM_RESPONSE_COMPLETE' });

      await this.tangyFormService.saveResponse(tangyFormEl.response);

      const queryResponseId = tangyFormEl.response._id;
      eventForm.formResponseId = queryResponseId;
      await this.save();

      return queryResponseId;
  }

  async valueExists(form, variable, value) {
    const formResponses = await this.tangyFormService.getResponsesByFormId(form);
    for (let i = 0; i < formResponses.length; i++) {
      const formVariable = formResponses[i].inputs.find(input => input.name === variable);
      if (formVariable && formVariable.value === value) {
        return true;
      }
    }
    return false;
  }

  /*
   * Case Template API
   */

  // Exports current case to json. Used in generate-cases as template.
  async export():Promise<Array<TangyFormResponseModel>> {
    const docs = [this.case]
    const formResponseDocIds = this.case.events.reduce((formResponseDocIds, caseEvent) => {
      return [
        ...formResponseDocIds,
        ...caseEvent.eventForms.map(eventForm => eventForm.formResponseId)
      ]
    }, [])
    for (let formResponseDocId of formResponseDocIds) {
      if (formResponseDocId) {
        const doc = await this.tangyFormService.getResponse(formResponseDocId)
        if (doc) {
          docs.push(await this.tangyFormService.getResponse(formResponseDocId))
        } else {
          console.log('No response for ' + formResponseDocId);
        }
      }
    }
    return docs
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  async generateCases(numberOfCases) {
    let numberOfCasesCompleted = 0
    let firstnames = ['Mary', 'Jennifer', 'Lisa', 'Sandra	','Michelle',
    'Patricia', 'Maria','Nancy','Donna','Laura', 'Linda','Susan','Karen',
      'Carol','Sarah','Barbara','Margaret','Betty','Ruth','Kimberly','Elizabeth',
      'Dorothy','Helen','Sharon','Deborah']
    let surnames = ['Smith','Johnson','Williams','Jones','Brown','Davis','Miller',
      'Wilson','Moore','Taylor','Anderson','Thomas','Jackson','White','Harris',
      'Martin','Thompson','Garcia','Martinez','Robinson','Clark','Rodriguez','Lewis','Lee','Walker']

    while (numberOfCasesCompleted < numberOfCases) {
      const templateDocs = await this.export()
      const caseDoc = templateDocs.find(doc => doc['type'] === 'case')
      // Change the case's ID.
      const caseId = UUID()
      caseDoc._id = caseId
      const participant_id = Math.round(Math.random() * 1000000)
      // let firstname = "Helen" + Math.round(Math.random() * 100)
      // let surname = "Smith" + Math.round(Math.random() * 100)
      const firstname = firstnames[this.getRandomInt(0, firstnames.length + 1)]
      const surname = surnames[this.getRandomInt(0, surnames.length + 1)]
      let barcode_data =  { "participant_id": participant_id, "treatment_assignment": "Experiment", "bin-mother": "A", "bin-infant": "B", "sub-studies": { "S1": true, "S2": false, "S3": false, "S4": true } }
      let tangerineModifiedOn = new Date();
      // tangerineModifiedOn is set to numberOfCasesCompleted days before today, and its time is set based upon numberOfCasesCompleted.
      tangerineModifiedOn.setDate( tangerineModifiedOn.getDate() - numberOfCasesCompleted );
      tangerineModifiedOn.setTime( tangerineModifiedOn.getTime() - ( numberOfCases - numberOfCasesCompleted ) )
      const day = String(tangerineModifiedOn.getDate()).padStart(2, '0');
      const month = String(tangerineModifiedOn.getMonth() + 1).padStart(2, '0');
      const year = tangerineModifiedOn.getFullYear();
      const screening_date = year + '-' + month + '-' + day;
      const enrollment_date = screening_date;
      let caseMother = {
        _id: caseId,
        tangerineModifiedOn: tangerineModifiedOn,
        "participants": [{
          "id": participant_id,
          "caseRoleId": "mother-role",
          "data": {
            "firstname": firstname,
            "surname": surname,
            "participant_id": participant_id
          }
        }],
      }
      const doc = Object.assign({}, caseDoc, caseMother);
      caseDoc.items[0].inputs[6].value = participant_id;
      // caseDoc.items[0].inputs[2].value = enrollment_date;
      caseDoc.items[0].inputs[4].value = firstname;
      caseDoc.items[0].inputs[5].value = surname;
      for (let caseEvent of caseDoc['events']) {
        const caseEventId = UUID()
        caseEvent.id = caseEventId
        for (let eventForm of caseEvent.eventForms) {
          eventForm.id = UUID()
          eventForm.caseId = caseId
          eventForm.caseEventId = caseEventId
          // Some eventForms might not have a corresponding form response.
          if (eventForm.formResponseId) {
            const originalId = `${eventForm.formResponseId}`
            const newId = UUID()
            // Replace originalId with newId in both the reference to the FormResponse doc and the FormResponse doc itself.
            eventForm.formResponseId = newId
            const formResponse = templateDocs.find(doc => doc._id === originalId)
            if (typeof formResponse !== 'undefined') {
              formResponse._id = newId
            }
          }
        }
      }
      // modify the demographics form - s01a-participant-information-f254b9
      const demoDoc = templateDocs.find(doc => doc.form.id === 'mnh_screening_and_enrollment')
      if (demoDoc) {
        demoDoc.items[0].inputs[3].value = screening_date;
        // "id": "randomization",
        // demoDoc.items[10].inputs[1].value = barcode_data;
        demoDoc.items[10].inputs[2].value = participant_id;
        demoDoc.items[10].inputs[7].value = enrollment_date;
        // "id": "participant_information",
        demoDoc.items[5].inputs[1].value = firstname;
        demoDoc.items[5].inputs[2].value = surname;
      }

      for (let doc of templateDocs) {
        // @ts-ignore
        // sometimes doc is false...
        if (doc !== false) {
          try {
            delete doc._rev
            await this.tangyFormService.saveResponse(doc)
          } catch (e) {
            console.log('Error: ' + e)
          }
        }
      }
      numberOfCasesCompleted++
      console.log("motherId: " + caseId + " participantId: " + participant_id + " Completed " + numberOfCasesCompleted + " of " + numberOfCases);
    }
  }

}

interface CaseInfo {
  caseInstance: Case
  caseDefinition:CaseDefinition
}

// @TODO We should revisit this logic. Not sure it's what we want.
export const markQualifyingCaseAsComplete = ({caseInstance, caseDefinition}:CaseInfo):CaseInfo => {
  // Check to see if all required Events are complete in Case. If so, mark Case complete.
  let numberOfCaseEventsRequired = caseDefinition
    .eventDefinitions
    .reduce((acc, definition) => definition.required ? acc + 1 : acc, 0)
  let numberOfUniqueCompleteCaseEvents = caseInstance
    .events
    .reduce((acc, instance) => instance.complete === true
        ? Array.from(new Set([...acc, instance.caseEventDefinitionId]))
        : acc
      , [])
      .length
  caseInstance
    .complete = numberOfCaseEventsRequired === numberOfUniqueCompleteCaseEvents ? true : false
  return { caseInstance, caseDefinition }
}

export const markQualifyingEventsAsComplete = ({caseInstance, caseDefinition}:CaseInfo):CaseInfo => {
  return {
    caseInstance: {
      ...caseInstance,
      events: caseInstance.events.map(event => {
        return {
          ...event,
          complete: !caseDefinition
            .eventDefinitions
            .find(eventDefinition => eventDefinition.id === event.caseEventDefinitionId)
            .eventFormDefinitions
            .some(eventFormDefinition => {
              // 1. Is required and has no Event Form instances.
              return (
                  eventFormDefinition.required === true &&
                  !event.eventForms.some(eventForm => eventForm.eventFormDefinitionId === eventFormDefinition.id)
                ) ||
                // 2. Is required and at least one Event Form instance is not complete.
                (
                  eventFormDefinition.required === true &&
                  event.eventForms
                    .filter(eventForm => eventForm.eventFormDefinitionId === eventFormDefinition.id)
                    .some(eventForm => !eventForm.complete)
                ) ||
                // 3. Is not required and has at least one Event Form instance that is both incomplete and required.
                (
                  eventFormDefinition.required === false &&
                  event.eventForms
                    .filter(eventForm => eventForm.eventFormDefinitionId === eventFormDefinition.id)
                    .some(eventForm => !eventForm.complete && eventForm.required)
                )
            })
        }
      })
    },
    caseDefinition
  }
}

export { CaseService };
