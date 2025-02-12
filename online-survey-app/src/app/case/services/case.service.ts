import { AppConfigService, LocationNode } from './../../shared/_services/app-config.service';
import { EventFormDefinition } from './../classes/event-form-definition.class';
import { Subject } from 'rxjs';
import { NotificationStatus, Notification, NotificationType } from './../classes/notification.class';
// Services.
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
    private appConfigService:AppConfigService,
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

  createEvent(eventDefinitionId:string) {
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

    return caseEvent
  }

  async onCaseEventCreate(caseEvent: CaseEvent) {
    const caseEventDefinition = this.caseDefinition
    .eventDefinitions
    .find(eventDefinition => eventDefinition.id === caseEvent.caseEventDefinitionId)

    await eval(caseEventDefinition.onEventCreate)
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
    if (caseEvent && caseEvent.archived) {
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
      if (eventForm) {
        if (eventForm.formResponseId) {
          const formResponse = await this.tangyFormService.getResponse(eventForm.formResponseId)
          if (formResponse && !formResponse.archived) {
            formResponse.archived = true
            await this.tangyFormService.saveResponse(formResponse)
          }
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
      if (eventForm) {
        if (eventForm.formResponseId) {
          const formResponse = await this.tangyFormService.getResponse(eventForm.formResponseId)
          if (formResponse && formResponse.archived) {
            formResponse.archived = false
            await this.tangyFormService.saveResponse(formResponse)
          }
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
