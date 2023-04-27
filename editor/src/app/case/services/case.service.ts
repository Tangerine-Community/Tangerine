import { AppConfigService, LocationNode } from './../../shared/_services/app-config.service';
import { EventFormDefinition } from './../classes/event-form-definition.class';
import { Subject } from 'rxjs';
import { NotificationStatus, Notification, NotificationType } from './../classes/notification.class';
import { Issue, IssueStatus, IssueEvent, IssueEventType } from './../classes/issue.class';
// Services.
import { DeviceService } from 'src/app/device/services/device.service';
import { TangyFormService } from 'src/app/tangy-forms/tangy-form.service';
import { CaseDefinitionsService } from './case-definitions.service';
import { HttpClient } from '@angular/common/http';
import { UserService } from 'src/app/core/auth/_services/user.service';
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
import { GroupDevicesService } from '../../groups/services/group-devices.service'

@Injectable({
  providedIn: 'root'
})
class CaseService {

  _case:Case
  caseDefinition:CaseDefinition
  location:Array<LocationNode>

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
    private userService:UserService,
    private appConfigService:AppConfigService,
    private http:HttpClient,
    private groupDevicesService:GroupDevicesService
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

  get groupId() {
    return this._case.groupId
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
    this.case.label = this.caseDefinition.name
    await this.save()
  }

  async archive() {
    const eventForms:Array<EventForm> = this.case.events.reduce((eventForms, event) => {
      return Array.isArray(event.eventForms)
        ? [...eventForms, ...event.eventForms]
        : eventForms
    }, [])
    for (let eventForm of eventForms) {
      if (eventForm.formResponseId) {
        const formResponse = await this.tangyFormService.getResponse(eventForm.formResponseId)
        if (formResponse) {
          formResponse.archived = true
          await this.tangyFormService.saveResponse(formResponse)
        }
      }
    }
    this.case.archived=true
    await this.save() 
  }

  async unarchive() {
    const eventForms:Array<EventForm> = this.case.events.reduce((eventForms, event) => {
      return Array.isArray(event.eventForms)
        ? [...eventForms, ...event.eventForms]
        : eventForms
    }, [])
    for (let eventForm of eventForms) {
      if (eventForm.formResponseId) {
        const formResponse = await this.tangyFormService.getResponse(eventForm.formResponseId)
        if (formResponse) {
          formResponse.archived = false 
          await this.tangyFormService.saveResponse(formResponse)
        }
      }
    }
    this.case.archived = false 
    await this.save() 
  }

  async delete() {
    const eventForms:Array<EventForm> = this.case.events.reduce((eventForms, event) => {
      return Array.isArray(event.eventForms)
        ? [...eventForms, ...event.eventForms]
        : eventForms
    }, [])
    for (let eventForm of eventForms) {
      if (eventForm.formResponseId) {
        const formResponse = await this.tangyFormService.getResponse(eventForm.formResponseId)
        if (formResponse) {
          const archivedFormResponse = new TangyFormResponseModel(
            {
              archived:true,
              _rev : formResponse._rev,
              _id : formResponse._id,
              form : {
                id: formResponse.form.id,
                title: formResponse.form.title,
                tagName: formResponse.form.tagName,
                complete: formResponse.form.complete
              },
              items : [],
              events : [],
              location : formResponse.location,
              type : "response",
              caseId: formResponse.caseId,
              eventId: formResponse.eventId,
              eventFormId: formResponse.eventFormId,
              participantId: formResponse.participantId,
              groupId: formResponse.groupId,
              complete: formResponse.complete,
              tangerineModifiedOn: new Date().getTime()
            }
          )
          await this.tangyFormService.saveResponse(archivedFormResponse)
        }
      }
    }
    await this.closeIssuesForCase(this.case._id, "Case Deletion")

    this.case.archived=true
    // Keeping inputs so that the case show up in searches *on the server*
    const archivedCase = new Case(
      {
        archived:true,
        _rev : this.case._rev,
        _id : this.case._id,
        form : {
          id: this.case.form.id,
          tagName: this.case.form.tagName,
          complete: this.case.form.complete
        },
        items : [{}],
        events : [],
        location : this.case.location,
        type : "case",
        caseDefinitionId: this.case.caseDefinitionId,
        groupId: this.case['groupId'],
        complete: this.case.complete,
        tangerineModifiedOn: new Date().getTime()
      }
    )
    if (this.case.items[0]) {
      archivedCase.items[0].id = this.case.items[0].id
      archivedCase.items[0].title = this.case.items[0].title
      archivedCase.items[0].tagName = this.case.items[0].tagName
      archivedCase.items[0].inputs = this.case.items[0].inputs
    }
    await this.tangyFormService.saveResponse(archivedCase)
  }

  async closeIssuesForCase(caseId, comment) {
    const userId = window['userId']
    const username = window['username']
    const db = await window['T'].user.getUserDatabase(username)
    const results = await db.query('issuesByCaseId',
      {
        startkey: `${caseId}`,
        endkey: `${caseId}\uffff`
      }
    )
    if (results?.rows.length > 0) {
      var issues = results.rows
      for (const issue of issues) {
        await this.closeIssue(issue.id, comment, username, userId)
      }
    }
  }

  async closeIssuesForFormResponse(formResponseId, comment) {
    const userId = window['userId']
    const username = window['username']
    const db = await window['T'].user.getUserDatabase(username)
    const results = await db.query('issuesByFormResponseId',
      {
        startkey: `${formResponseId}`,
        endkey: `${formResponseId}\uffff`
      }
    )
    if (results?.rows.length > 0) {
      var issues = results.rows
      for (const issue of issues) {
        await this.closeIssue(issue.id, comment, username, userId)
      }
    }
  }
  
  async setCase(caseInstance) {
    // Note the order of setting caseDefinition before case matters because the setter for case expects caseDefinition to be the current one.
    this.caseDefinition = (await this.caseDefinitionsService.load())
      .find(caseDefinition => caseDefinition.id === caseInstance.caseDefinitionId)
    const flatLocationList = await this.appConfigService.getFlatLocationList()
    this.location = Object.keys(caseInstance.location).map(level => flatLocationList.locations.find(node => node.id === caseInstance.location[level]))
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

  async createEvent(eventDefinitionId:string): Promise<CaseEvent> {
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
      startDate: 0,
      archived: false
    }
    this.case.events.push(caseEvent)
    for (const caseParticipant of this.case.participants) {
      for (const eventFormDefinition of caseEventDefinition.eventFormDefinitions) {
        if (eventFormDefinition.forCaseRole.split(',').map(e=>e.trim()).includes(caseParticipant.caseRoleId)
          &&
          (
            eventFormDefinition.autoPopulate || 
            (eventFormDefinition.autoPopulate === undefined && eventFormDefinition.required === true)
          )
        ) {
          this.createEventForm(caseEvent.id, eventFormDefinition.id, caseParticipant.id)
        }
      }
    }

    await eval(caseEventDefinition.onEventCreate)

    return caseEvent
  }

  setEventName(eventId, name:string) {
    this.case.events = this.case.events.map(event => {
      return event.id === eventId
        ? { ...event, ...{ name } }
        : event
    })
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

  activateCaseEvent(caseEventId:string) {
    this.case = {
      ...this.case,
      events: this.case.events.map(event => {
        return event.id === caseEventId
          ? {
            ...event,
            inactive: false
          }
          : event
      })
    }
  }

  deactivateCaseEvent(caseEventId:string) {
    this.case = {
      ...this.case,
      events: this.case.events.map(event => {
        return event.id === caseEventId
          ? {
            ...event,
            inactive: true
          }
          : event
      })
    }
  }

  async archiveCaseEvent(caseEventId:string) {
    const caseEvent = this.case.events.find(event => event.id === caseEventId)
    if (caseEvent && !caseEvent.archived) {
      var unarchivedEventForms = caseEvent.eventForms.filter(form => !form.archived)
      for (var eventForm of unarchivedEventForms) {
        if (eventForm.formResponseId) {
          const formResponse = await this.tangyFormService.getResponse(eventForm.formResponseId)
          if (formResponse) {
            formResponse.archived = true
            await this.tangyFormService.saveResponse(formResponse)
          }
        }
        eventForm.archived = true
      }
      caseEvent.archived = true
      await this.save()
    }
  }

  async unarchiveCaseEvent(caseEventId:string) {
    const caseEvent = this.case.events.find(event => event.id === caseEventId)
    if (caseEvent && !caseEvent.archived) {
      var archivedEventForms = caseEvent.eventForms.filter(form => form.archived)
      for (var eventForm of archivedEventForms) {
        if (eventForm.formResponseId) {
          const formResponse = await this.tangyFormService.getResponse(eventForm.formResponseId)
          if (formResponse) {
            formResponse.archived = false
            await this.tangyFormService.saveResponse(formResponse)
          }
        }
        eventForm.archived = false
      }
      caseEvent.archived = false
      await this.save()
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

  activateEventForm(caseEventId:string, eventFormId:string) {
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
              inactive: false
            }
          )
        }
      )
    }
  }

  deactivateEventForm(caseEventId:string, eventFormId:string) {
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
              inactive: true
            }
          )
        }
      )
    }
  }

  async archiveEventForm(caseEventId:string, eventFormId:string) {
    const caseEvent = this.case.events.find(event => event.id === caseEventId)
    if (caseEvent) {
      var eventForm = caseEvent.eventForms.find(form => form.id === eventFormId)
      if (eventForm && eventForm.formResponseId) {
          const formResponse = await this.tangyFormService.getResponse(eventForm.formResponseId)
          if (formResponse && !formResponse.archived) {
            formResponse.archived = true
            await this.tangyFormService.saveResponse(formResponse)
          }
          eventForm.archived = true
          await this.save()
        }
    }
  }

  async unarchiveEventForm(caseEventId:string, eventFormId:string) {
    const caseEvent = this.case.events.find(event => event.id === caseEventId)
    if (caseEvent) {
      var eventForm = caseEvent.eventForms.find(form => form.id === eventFormId)
      if (eventForm && eventForm.formResponseId) {
          const formResponse = await this.tangyFormService.getResponse(eventForm.formResponseId)
          if (formResponse && formResponse.archived) {
            formResponse.archived = false
            await this.tangyFormService.saveResponse(formResponse)
          }
          eventForm.archived = false
          await this.save()
        }
    }
  }

  /*
   * Form Response API
   */

  async archiveFormResponse(caseEventId:string, eventFormId:string) {
    const caseEvent = this.case.events.find(event => event.id === caseEventId)
    if (caseEvent) {
      var eventForm = caseEvent.eventForms.find(form => form.id === eventFormId)
      if (eventForm && eventForm.formResponseId) {
          const formResponse = await this.tangyFormService.getResponse(eventForm.formResponseId)
          if (formResponse) {
            formResponse.archived = true
            await this.tangyFormService.saveResponse(formResponse)
          }
          eventForm.archived = true
          await this.save()
        }
    }
  }

  async unarchiveFormResponse(caseEventId:string, eventFormId:string) {
    const caseEvent = this.case.events.find(event => event.id === caseEventId)
    if (caseEvent) {
      var eventForm = caseEvent.eventForms.find(form => form.id === eventFormId)
      if (eventForm && eventForm.formResponseId) {
          const formResponse = await this.tangyFormService.getResponse(eventForm.formResponseId)
          if (formResponse) {
            formResponse.archived = false
            await this.tangyFormService.saveResponse(formResponse)
          }
          eventForm.archived = false
          await this.save()
        }
    }
  }

  async deleteFormResponse(caseEventId:string, eventFormId:string) {
    const caseEvent = this.case.events.find(event => event.id === caseEventId)
    if (caseEvent) {
      var eventForm = caseEvent.eventForms.find(form => form.id === eventFormId)
      if (eventForm && eventForm.formResponseId) {
        const formResponse = await this.tangyFormService.getResponse(eventForm.formResponseId)
        if (formResponse) {
          const archivedFormResponse = new TangyFormResponseModel(
            {
              archived:true,
              _rev : formResponse._rev,
              _id : formResponse._id,
              form : {
                id: formResponse.form.id,
                title: formResponse.form.title,
                tagName: formResponse.form.tagName,
                complete: formResponse.form.complete
              },
              items : [],
              events : [],
              location : formResponse.location,
              type : "response",
              caseId: formResponse.caseId,
              eventId: formResponse.eventId,
              eventFormId: formResponse.eventFormId,
              participantId: formResponse.participantId,
              groupId: formResponse.groupId,
              complete: formResponse.complete,
              tangerineModifiedOn: new Date().getTime()
            }
          )
          await this.tangyFormService.saveResponse(archivedFormResponse)

          await this.closeIssuesForFormResponse(formResponse.id, "Closed for Form Response Deletion")
        }
        this.deleteEventForm(caseEventId, eventFormId)
        await this.save()
      }
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
        if (eventFormDefinition.forCaseRole.split(',').map(e=>e.trim()).includes(caseRoleId)
          &&
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

  addParticipant(caseParticipant:CaseParticipant) {
    this.case.participants.push(caseParticipant)
    for (let caseEvent of this.case.events) {
      const caseEventDefinition = this
        .caseDefinition
        .eventDefinitions
        .find(eventDefinition => eventDefinition.id === caseEvent.caseEventDefinitionId)
      for (let eventFormDefinition of caseEventDefinition.eventFormDefinitions) {
        if (
          eventFormDefinition.forCaseRole.split(',').map(e=>e.trim()).includes(caseParticipant.caseRoleId)
          && 
          (
            eventFormDefinition.autoPopulate || 
            (eventFormDefinition.autoPopulate === undefined && eventFormDefinition.required === true)
          )
        ) {
          this.createEventForm(caseEvent.id, eventFormDefinition.id, caseParticipant.id)
        }
      }
    }
  }

  async activateParticipant(participantId:string) {
    this.case = {
      ...this.case,
      participants: this.case.participants.map(participant => {
        return participant.id === participantId
          ? {
            ...participant,
            inactive: false 
          }
          : participant
      })
    }
  }

  async deactivateParticipant(participantId:string) {
    this.case = {
      ...this.case,
      participants: this.case.participants.map(participant => {
        return participant.id === participantId
          ? {
            ...participant,
            inactive: true 
          }
          : participant
      })
    }
  }


  async getParticipantFromAnotherCase(sourceCaseId, sourceParticipantId) {
    const currCaseId = this.case._id

    await this.load(sourceCaseId)
    const sourceCase = this.case
    const sourceParticipant = sourceCase.participants.find(sourceParticipant =>
      sourceParticipant.id === sourceParticipantId)
      
    await this.load(currCaseId)

    return sourceParticipant
  }

  async deleteParticipantInAnotherCase(sourceCaseId, sourceParticipantId) {
    const currCaseId = this.case._id

    await this.load(sourceCaseId)
    this.case.participants = this.case.participants.filter(sourceParticipant =>
        sourceParticipant.id === sourceParticipantId)
    await this.save()

    await this.load(currCaseId)
  }

  async copyParticipantFromAnotherCase(sourceCaseId, sourceParticipantId) {
    const caseParticipant = await this.getParticipantFromAnotherCase(sourceCaseId, sourceParticipantId)
    if (caseParticipant !== undefined) {
      this.addParticipant(caseParticipant)
    }
  }

  async moveParticipantFromAnotherCase(sourceCaseId, sourceParticipantId) {
    const caseParticipant = await this.getParticipantFromAnotherCase(sourceCaseId, sourceParticipantId)
    if (caseParticipant !== undefined) {
      this.addParticipant(caseParticipant)

      // Only delete the participant from the other case after adding it to this case is successful
      await this.deleteParticipantInAnotherCase(sourceCaseId, sourceParticipantId)
    }
  }

  async searchForParticipant(username:string, phrase:string, limit = 50, skip = 0, unique = true):Promise<Array<any>> {
    const db = await window['T'].user.getUserDatabase(username)
    const result = await db.query(
      'participantSearch',
      phrase
        ? { 
          startkey: `${phrase}`.toLocaleLowerCase(),
          endkey: `${phrase}\uffff`.toLocaleLowerCase(),
          include_docs: true,
          limit,
          skip
        }
        : {
          include_docs: true,
          limit,
          skip
        } 
    )
    const searchResults = result.rows.map(row => {
      return {
        ...row.value,
        case: row.doc,
        participant: row.doc.participants.find(p => p.id === row.value.participantId)
      }
    })
    // Deduplicate the search results since the same case may match on multiple variables.
    return unique
      ? searchResults.reduce((uniqueResults, result) => {
        return uniqueResults.find(x => x.participantId === result.participantId)
          ? uniqueResults
          : [ ...uniqueResults, result ]
      }, [])
      : searchResults
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
   */
  queuedIssuesForCreation:Array<any> = []

  async queueIssueForCreation (label = '', comment = '') {
    this.queuedIssuesForCreation.push({
      label,
      comment
    })
  }

  async createIssuesInQueue() {
    for (let queuedIssue of this.queuedIssuesForCreation) {
      await this.createIssue(queuedIssue.label, queuedIssue.comment, this.case._id, this.getCurrentCaseEventId(), this.getCurrentEventFormId(), window['username'], window['username'], false, '')
    }
    this.queuedIssuesForCreation = []
  }

  async createIssue (label = '', comment = '', caseId:string, eventId:string, eventFormId:string, userId, userName, sendToAllDevices = false, sendToDeviceById = '') {
    const caseData = await this.tangyFormService.getResponse(caseId)
    const formResponseId = caseData
      .events.find(event => event.id === eventId)
      .eventForms.find(eventForm => eventForm.id === eventFormId)
      .formResponseId
    const issue = new Issue({
      _id: UUID(),
      label,
      location: caseData.location,
      caseId,
      createdOn: Date.now(),
      createdAppContext: AppContext.Editor,
      sendToAllDevices, 
      sendToDeviceById,
      eventId,
      eventFormId,
      status: IssueStatus.Open,
      formResponseId
    })
    await this.tangyFormService.saveResponse(issue)
    await this.openIssue(issue._id, comment, userId, userName)
    await this.updateIssueMeta(issue._id, label, comment, sendToAllDevices, sendToDeviceById, userName, userId)
    return await this.getIssue(issue._id)
  }

  async updateIssueMeta(issueId:string, label:string, description:string, sendToAllDevices:boolean, sendToDeviceById:string, userName:string, userId:string) {
    const issue = new Issue(await this.tangyFormService.getResponse(issueId))
    issue.label = label
    issue.description = description
    issue.sendToAllDevices = sendToAllDevices
    issue.sendToDeviceById = sendToDeviceById
    issue.events.push(<IssueEvent>{
      id: UUID(),
      type: IssueEventType.UpdateMeta,
      date: Date.now(),
      userName,
      userId,
      createdAppContext: AppContext.Editor,
      data: {
        label,
        description,
        sendToAllDevices,
        sendToDeviceById
      }
    })
    return await this.tangyFormService.saveResponse(issue)
  }

  async getIssue(issueId) {
    return new Issue(await this.tangyFormService.getResponse(issueId))
  }

  async openIssue(issueId:string, comment:string, userId:string, userName:string) {
    const issue = new Issue(await this.tangyFormService.getResponse(issueId))
    const caseInstance = await this.tangyFormService.getResponse(issue.caseId)
    const response = await this.tangyFormService.getResponse(issue.formResponseId)
    issue.events.push(<IssueEvent>{
      id: UUID(),
      type: IssueEventType.Open,
      date: Date.now(),
      userName,
      userId,
      createdAppContext: AppContext.Editor,
      data: {
        comment,
        caseInstance,
        response
      }
    })
    return await this.tangyFormService.saveResponse({
      ...issue,
      status: IssueStatus.Open
    })
  }

  async rebaseIssue(issueId:string, userId:string, userName:string) {
    const issue = new Issue(await this.tangyFormService.getResponse(issueId))
    const caseInstance = await this.tangyFormService.getResponse(issue.caseId)
    const response = await this.tangyFormService.getResponse(issue.formResponseId)
    // If the Event or Event Form related to issue are not longer in the caseInstance, restore them.
    // This may be due to either the Event or Event Form being removed, or a Data Conflict where this Event or Event Form is in the losing revision.
    let currentEvent = caseInstance.events.find(event => event.id === issue.eventId)
    if (!currentEvent) {
      if (await this.hasProposedChange(issueId)) {
        const proposedRevisionIssueEvent = await this.getProposedChange(issueId)
        const theMissingCaseEvent = proposedRevisionIssueEvent.caseInstance.events.find(event => event.id === issue.eventId)
        caseInstance.events.push(theMissingCaseEvent)
      } else {
        const baseEvent = [...issue.events].reverse().find(event => event.type === IssueEventType.Open || event.type === IssueEventType.Rebase)
        const theMissingCaseEvent = baseEvent.data.caseInstance.events.find(event => event.id === issue.eventId)
        caseInstance.events.push(theMissingCaseEvent)
      }
      currentEvent = caseInstance.events.find(event => event.id === issue.eventId)
    }
    let currentEventForm = currentEvent.eventForms.find(eventForm => eventForm.id === issue.eventFormId)
    if (!currentEventForm) {
      if (await this.hasProposedChange(issueId)) {
        const proposedRevisionIssueEvent = await this.getProposedChange(issueId)
        const theMissingEventForm = proposedRevisionIssueEvent.caseInstance
          .events.find(event => event.id === issue.eventId)
          .eventForms.find(eventForm => eventForm.id === issue.eventFormId)
        currentEvent.eventForms.push(theMissingEventForm)
      } else {
        const baseEvent = [...issue.events].reverse().find(event => event.type === IssueEventType.Open || event.type === IssueEventType.Rebase)
        const theMissingEventForm = baseEvent.data.caseInstance
          .events.find(event => event.id === issue.eventId)
          .eventForms.find(eventForm => eventForm.id === issue.eventFormId)
        currentEvent.eventForms.push(theMissingEventForm)
      }
    }
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



  async closeIssue(issueId:string, comment:string, userId:string, userName:string) {
    const issue = new Issue(await this.tangyFormService.getResponse(issueId))
    if (issue.status == IssueStatus.Closed) {
      return issue
    }

    issue.events.push(<IssueEvent>{
      id: UUID(),
      type: IssueEventType.Close,
      date: Date.now(),
      userName,
      userId,
      createdAppContext: AppContext.Editor,
      data: {
        comment
      }
    })
    return await this.tangyFormService.saveResponse({
      ...issue,
      status: IssueStatus.Closed
    })
  }


  async commentOnIssue(issueId, comment, userId, userName) {
    const issue = <Issue>await this.tangyFormService.getResponse(issueId)
    issue.events.push(<IssueEvent>{
      id: UUID(),
      type: IssueEventType.Comment,
      userName,
      createdAppContext: AppContext.Editor,
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
      const caseInstance = await this.tangyFormService.getResponse(issue.caseId)
      let proposedChangeResponse;
      if (issue.docType === 'response') {
        proposedChangeResponse = await this.tangyFormService.getResponse(issue.formResponseId)
      } else {
        // TODO: add condition for issue.docType === 'issue'
        proposedChangeResponse = caseInstance
      }
      return {
        response: proposedChangeResponse,
        caseInstance: caseInstance
      }
    } else {
      return lastProposedChangeEvent.data
    }
  }

  async saveProposedChange(response, caseInstance, issueId, userId, userName) {
    const issue = <Issue>await this.tangyFormService.getResponse(issueId)
    // Calculate the diff.
    let a:any
    let b = response
    if (await this.hasProposedChange(issueId)) {
      const currentProposedChange = await this.getProposedChange(issueId)
      a = currentProposedChange.response
    } else {
      const baseEvent = [...issue.events].reverse().find(event => event.type === IssueEventType.Open || event.type === IssueEventType.Rebase)
      a = baseEvent.data.response
    }
    let diff 
    try {
      diff = this.diffFormResponses(a, b)
    } catch(e) {
      console.error(e)
      diff = [
        {
          name: 'error',
          error: 'Error calculating diff',
          a: '',
          b: '' 
        }
      ]
    }
    // Create the ProposedChange event.
    issue.events.push(<IssueEvent>{
      id: UUID(),
      type: IssueEventType.ProposedChange,
      userName,
      createdAppContext: AppContext.Editor,
      date: Date.now(),
      userId,
      data: {
        diff,
        response,
        caseInstance
      }
    })
    return await this.tangyFormService.saveResponse(issue)
  }

  async mergeProposedChange(issueId:string, userId:string, userName:string) {
    // @TODO Throw error is baseEvent's _rev's don't match what is in the db.
    const issue = new Issue(await this.tangyFormService.getResponse(issueId))
    issue.events.push(<IssueEvent>{
      id: UUID(),
      type: IssueEventType.Merge,
      date: Date.now(),
      createdAppContext: AppContext.Editor,
      userName,
      userId
    })
    const proposedFormResponse = await this.getProposedChange(issueId)
    await this.tangyFormService.saveResponse(proposedFormResponse.response)
    await this.tangyFormService.saveResponse(proposedFormResponse.caseInstance)
    if (issue.sendToDeviceById) {
      const device = await this.groupDevicesService.getDevice(this.groupId, issue.sendToDeviceById)
      device.assignedFormResponseIds = [...new Set([...(device.assignedFormResponseIds ? device.assignedFormResponseIds : []), ...[proposedFormResponse.response._id]])];
      await this.groupDevicesService.updateDevice(this.groupId, device)
    }
    await this.load(proposedFormResponse.caseInstance._id)
    return await this.tangyFormService.saveResponse({
      ...issue,
      status: IssueStatus.Merged
    })
  }

  async hasProposedChange(issueId:string) {
    const issue = new Issue(await this.tangyFormService.getResponse(issueId))
    const baseEvent = [...issue.events].reverse().find(event => event.type === IssueEventType.Open || event.type === IssueEventType.Rebase)
    const indexOfBaseEvent = issue.events.findIndex(event => event.id === baseEvent.id)
    return !!issue.events.find((event, i) => event.type === IssueEventType.ProposedChange && i > indexOfBaseEvent)
  }

  async canMergeProposedChange(issueId:string) {
    const issue = new Issue(await this.tangyFormService.getResponse(issueId))
    const eventBase = [...issue.events]
      .reverse()
      .find(event => event.type === IssueEventType.Rebase || event.type === IssueEventType.Open)
    const currentFormResponse = await this.tangyFormService.getResponse(issue.formResponseId)
    const currentCaseInstance = await this.tangyFormService.getResponse(issue.caseId)
    return currentFormResponse._rev === eventBase.data.response._rev && currentCaseInstance._rev === eventBase.data.caseInstance._rev ? true : false
  }

  async issueDiff(issueId) {
    const issue = new Issue(await this.tangyFormService.getResponse(issueId))
    const event = [...issue.events].reverse().find(event => event.type === IssueEventType.Open || event.type === IssueEventType.Rebase)
    const lastProposedChangeEvent = [...issue.events].reverse().find(event => event.type === IssueEventType.ProposedChange)
    let diffMetadata = [
      {
        "name": "Date (Original)",
        "a": {
          "name": "Date",
          "value": moment(event.date).format('dddd MMMM D, YYYY hh:mma')
        },
        "b": {
          "name": "Date (Proposed)",
          "value": lastProposedChangeEvent? moment(lastProposedChangeEvent.date).format('dddd MMMM D, YYYY hh:mma'):null
        }
      }]
    return lastProposedChangeEvent
      ? ([...this.diffFormResponses(event.data.response, lastProposedChangeEvent.data.response) ])
      // ? ([...diffMetadata, ...this.diffFormResponses(event.data.response, lastProposedChangeEvent.data.response) ])
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

  isIssueContext() {
    return window.location.hash.includes('/issues/')
      ? true
      : false
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
        caseEvent = await this.createEvent(this.queryCaseEventDefinitionId);
        await this.save();
      } else {
        caseEvent = this.case.events
        .find(caseEventInfo => caseEventInfo.caseEventDefinitionId === this.queryCaseEventDefinitionId);
      }

      const c = this.createEventForm(caseEvent.id, this.queryEventFormDefinitionId);
      await this.save();

      caseEvent = this.case.events.find(c => c.caseEventDefinitionId === this.queryCaseEventDefinitionId);
      const eventForm = caseEvent.eventForms.find(d => d.id === c.id);

      const referringCaseEvent: CaseEvent = this.case.events.find((event) => event.id === eventId);
      const referringEventName = referringCaseEvent.name;
      const formLink = '/case/event/form/' + caseId + '/' + eventId + '/' + formId;
      const queryLink = '/case/event/form/' + caseId + '/' + caseEvent.id + '/' + eventForm.id;

      const tangyFormContainerEl:any = document.createElement('div');
      tangyFormContainerEl.innerHTML = await this.tangyFormService.getFormMarkup(this.queryFormId, null);
      const tangyFormEl = tangyFormContainerEl.querySelector('tangy-form') ;
      tangyFormEl.style.display = 'none';
      document.body.appendChild(tangyFormContainerEl);

      tangyFormEl.newResponse();

      tangyFormEl.response.items[0].inputs = [
        { name: 'associatedCaseType', value: this.case.label },
        { name: 'associatedCaseId', value: caseId },
        { name: 'associatedEventId', value: eventId },
        { name: 'associatedFormId', value: formId },
        { name: 'associatedCaseName', value: participantId },
        { name: 'associatedEventName', value: referringEventName },
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

  async getCaseHistory(caseId:string = '', historyType = 'DEFAULT') {
    if (historyType === HistoryType.DEFAULT) {
      const appConfig = await this.appConfigService.getAppConfig()
      historyType = appConfig.attachHistoryToDocs
        ? HistoryType.DOC_HISTORY 
        : HistoryType.DB_REVISIONS
    }
    caseId = caseId || window.location.hash.split('/')[2]
    const history = historyType === HistoryType.DB_REVISIONS 
      ? await this.tangyFormService.getDocRevHistory(caseId)
      : (await this.tangyFormService.getResponse(caseId)).history
    return history 
  }

  async getEventFormHistory(caseId:string = '', caseEventId:string = '', eventFormId:string = '', historyType:HistoryType = HistoryType.DEFAULT) {
    caseId = caseId || window.location.hash.split('/')[4]
    caseEventId = caseEventId || window.location.hash.split('/')[5]
    eventFormId = eventFormId || window.location.hash.split('/')[6]
    const caseInstance = <Case>await this.tangyFormService.getResponse(caseId)
    const formResponseId = caseInstance
      .events.find(event => event.id === caseEventId)
      .eventForms.find(eventForm => eventForm.id === eventFormId)
      .formResponseId
    if (historyType === HistoryType.DEFAULT) {
      const appConfig = await this.appConfigService.getAppConfig()
      historyType = appConfig.attachHistoryToDocs
        ? HistoryType.DOC_HISTORY 
        : HistoryType.DB_REVISIONS
    }
    const history = historyType === HistoryType.DB_REVISIONS 
      ? await this.tangyFormService.getDocRevHistory(formResponseId)
      : (await this.tangyFormService.getResponse(formResponseId)).history
    return history
  }

}

export enum HistoryType {
  DEFAULT = 'DEFAULT',
  DB_REVISIONS = 'DB_REVISIONS',
  DOC_HISTORY = 'DOC_HISTORY',
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
