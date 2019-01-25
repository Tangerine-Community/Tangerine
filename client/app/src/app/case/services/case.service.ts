import { CaseEventDefinition } from '../classes/case-event-definition.class'
import { Case } from '../classes/case.class'
import { CaseEvent } from '../classes/case-event.class'
import { EventForm } from '../classes/event-form.class'
import { CaseDefinition } from '../classes/case-definition.class';
import { CaseDefinitionsService } from './case-definitions.service';
import PouchDB from 'pouchdb';
import UUID from 'uuid/v4'

class EventInfo {
  canCreateInstance:boolean;
  eventInstances:Array<CaseEvent>;
  eventDefinition:CaseEventDefinition;
}

class CaseService {

  _id:string
  _rev:string
  db:PouchDB
  case:Case
  caseDefinition:CaseDefinition
  caseDefinitionService:CaseDefinitionsService
  eventsInfo:Array<any>

  constructor() {
    this.db = new PouchDB(localStorage.getItem('currentUser'));
    this.caseDefinitionService = new CaseDefinitionsService()
  }

  async create(caseDefinitionId) {
    const caseInstance = new Case()
    caseInstance.caseDefinitionId = caseDefinitionId;
    caseInstance.label = (await this.caseDefinitionService.load())
      .find(caseDefinition => caseDefinition.id === caseDefinitionId)
      .name
    await this.setCase(caseInstance)
    await this.save()
  }

  async setCase(caseInstance) {
    this.case = caseInstance
    const caseDefinitionService = new CaseDefinitionsService();
    this.caseDefinition = (await caseDefinitionService.load())
      .find(caseDefinition => caseDefinition.id === this.case.caseDefinitionId)
    this.eventsInfo = this
      .caseDefinition
      .eventDefinitions
      .map(caseEventDefinition => {
        return {
          caseEventDefinition,
          canCreate: 
            caseEventDefinition.repeatable 
            || 
            this.case.events.reduce((numberOfMatchingEvents, caseEvent) => caseEvent.caseEventDefinitionId === caseEventDefinition.id 
              ? numberOfMatchingEvents + 1 
              : numberOfMatchingEvents
            , 0) === 0
            ? true 
            : false,
          caseEvents: caseInstance.events.filter(caseEvent => caseEvent.caseEventDefinitionId === caseEventDefinition.id)
        }
      }) 
  }

  async load(id:string) {
    await this.setCase(new Case(await this.db.get(id)))
  }

  async save() {
    await this.db.put(this.case)
    await this.setCase(await this.db.get(this.case._id))
  }

  async startEvent(eventDefinitionId:string):Promise<CaseEvent> {
    const caseEvent = new CaseEvent(
      UUID(),
      false,
      eventDefinitionId,
      eventDefinitionId,
      [],
      Date.now()
    )
    this.case.events.push(caseEvent)
    await this.save()
    return caseEvent
  }

  async startEventForm(caseEventId, eventFormId):Promise<EventForm> {
    const eventForm = new EventForm(UUID(), false, this.case._id, caseEventId, eventFormId)
    this
      .case
      .events
      .find(caseEvent => caseEvent.id === caseEventId)
      .eventForms
      .push(eventForm)
    await this.save()
    return eventForm
  }
  
  async markEventFormComplete(caseEventId:string, eventFormId:string) {
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
    await this.save()

    
  }

}

export { CaseService }