import { CaseEventDefinition } from '../classes/case-event-definition.class'
import { Case } from '../classes/case.class'
import { CaseEvent } from '../classes/case-event.class'
import { EventForm } from '../classes/event-form.class'
import { CaseDefinition } from '../classes/case-definition.class';
import { CaseDefinitionsService } from './case-definitions.service';
import PouchDB from 'pouchdb';
import * as UUID from 'uuid/v4'
import { TangyFormService } from 'src/app/tangy-forms/tangy-form.service';
import { WindowRef } from 'src/app/core/window-ref.service';
import { Injectable } from '@angular/core';
import { UserService } from 'src/app/shared/_services/user.service';


@Injectable({
  providedIn: 'root'
})
class CaseService {

  _id:string
  _rev:string
  db:PouchDB
  case:Case
  caseDefinition:CaseDefinition
  window:any

  constructor(
    private tangyFormService: TangyFormService,
    private caseDefinitionsService: CaseDefinitionsService,
    private windowRef: WindowRef,
    private userService:UserService
  ) { 
    this.window = this.windowRef.nativeWindow
  }

  async create(caseDefinitionId) {
    this.caseDefinition = <CaseDefinition>(await this.caseDefinitionsService.load())
      .find(caseDefinition => caseDefinition.id === caseDefinitionId)
    this.case = new Case({caseDefinitionId, events: [], _id: UUID()})
    delete this.case._rev
    const tangyFormContainerEl = this.window.document.createElement('div')
    tangyFormContainerEl.innerHTML = await this.tangyFormService.getFormMarkup(this.caseDefinition.formId)
    const tangyFormEl = tangyFormContainerEl.querySelector('tangy-form') 
    tangyFormEl.style.display = 'none'
    this.window.document.body.appendChild(tangyFormContainerEl)
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

  async setCase(caseInstance) {
    this.case = caseInstance
    this.caseDefinition = (await this.caseDefinitionsService.load())
      .find(caseDefinition => caseDefinition.id === this.case.caseDefinitionId)
 
  }

  async load(id:string) {
    this.db = await this.userService.getUserDatabase(this.userService.getCurrentUser())
    await this.setCase(new Case(await this.db.get(id)))
  }

  async save() {
    this.db = await this.userService.getUserDatabase(this.userService.getCurrentUser())
    await this.db.put(this.case)
    await this.setCase(await this.db.get(this.case._id))
  }

  createEvent(eventDefinitionId:string):CaseEvent {
    const caseEventDefinition = this.caseDefinition
      .eventDefinitions
      .find(eventDefinition => eventDefinition.id === eventDefinitionId)
    const caseEvent = <CaseEvent>{ 
      id: UUID(),
      caseId: this.case._id,
      complete: false,
      name: caseEventDefinition.name,
      estimate: true,
      caseEventDefinitionId: eventDefinitionId,
      dateStart: Date.now() + caseEventDefinition.estimatedTimeFromCaseOpening - (caseEventDefinition.estimatedTimeWindow/2),
      dateEnd: Date.now() + caseEventDefinition.estimatedTimeFromCaseOpening + (caseEventDefinition.estimatedTimeWindow/2),
      eventForms: [],
      startDate: 0
    }
    this.case.events.push(caseEvent)
    return caseEvent
  }

  startEvent(eventId) {
    // ??
  }

  async scheduleEvent(eventId, dateStart:number, dateEnd?:number) {
    this.case.events = this.case.events.map(event => {
      return event.id === eventId 
      ? { ...event, ...{ dateStart, dateEnd: dateEnd ? dateEnd : dateStart, estimate: false} }
      : event
    })
    
  }

  startEventForm(caseEventId, eventFormId):EventForm {
    const eventForm = <EventForm>{
      id: UUID(), 
      complete: false, 
      caseId: this.case._id, 
      caseEventId, 
      eventFormDefinitionId: eventFormId
    }
    this
      .case
      .events
      .find(caseEvent => caseEvent.id === caseEventId)
      .eventForms
      .push(eventForm)
    return eventForm
  }

  markEventFormComplete(caseEventId:string, eventFormId:string) {
    //
    let caseEvent = this
      .case
      .events
      .find(caseEvent => caseEvent.id === caseEventId)
    let eventDefinition = this
      .caseDefinition
      .eventDefinitions
      .find(eventDefinition => eventDefinition.id === caseEvent.caseEventDefinitionId)
    //
    caseEvent
      .eventForms
      .find(eventForm => eventForm.id === eventFormId)
      .complete = true
    //
    // Test this by opening case type 1, second event, filling out two of the second form, should be evrnt incomplete, then the first form, shoud be event complete
    //let eventForms = caseEvent.eventForms.filter(eventForm => eventForm.eventFormDefinitionId === eventDefinition.id)
    let numberOfEventFormsRequired = eventDefinition
      .eventFormDefinitions
      .reduce((acc, eventFormDefinition) => eventFormDefinition.required ? acc + 1 : acc, 0)
    let numberOfUniqueCompleteEventForms = caseEvent
      .eventForms
      .reduce((acc, eventForm) => eventForm.complete 
          ? Array.from(new Set([...acc, eventForm.eventFormDefinitionId])) 
          : acc
        , [])
        .length
    this
      .case
      .events
      .find(caseEvent => caseEvent.id === caseEventId)
      .complete = numberOfEventFormsRequired === numberOfUniqueCompleteEventForms ? true : false
    // Check to see if all required Events are complete in Case. If so, mark Case complete.
    let numberOfCaseEventsRequired = this.caseDefinition
      .eventDefinitions
      .reduce((acc, definition) => definition.required ? acc + 1 : acc, 0)
    let numberOfUniqueCompleteCaseEvents = this.case
      .events
      .reduce((acc, instance) => instance.complete 
          ? Array.from(new Set([...acc, instance.caseEventDefinitionId])) 
          : acc
        , [])
        .length
    this
      .case
      .complete = numberOfCaseEventsRequired === numberOfUniqueCompleteCaseEvents ? true : false
  }

  disableEventDefinition(eventDefinitionId) {
    if (this.case.disabledEventDefinitionIds.indexOf(eventDefinitionId) === -1) {
      this.case.disabledEventDefinitionIds.push(eventDefinitionId)
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

}

export { CaseService }