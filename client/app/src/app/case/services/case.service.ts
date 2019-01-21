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
  _id:string;
  _rev:string;
  db:PouchDB;
  case:Case;
  caseDefinition:CaseDefinition;
  eventsInfo:Array<any>;
  constructor() {
    this.db = new PouchDB(localStorage.getItem('currentUser'));
  }
  async create(caseDefinitionId) {
    const caseInstance = new Case()
    caseInstance.caseDefinitionId = caseDefinitionId;
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
      .map(eventDefinition => {
        return {
          eventDefinition,
          // @TODO: If there is an event, show a link...
          //If there is an event and this event type can have many then show "start event"
          //If there is not an event then show "start event"
          canCreateInstance: true,
          eventInstances: caseInstance.events.filter(eventInstance => eventInstance.eventDefinitionId === eventDefinition.id)
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
      eventDefinitionId,
      eventDefinitionId
    )
    this.case.events.push(caseEvent)
    await this.save()
    return caseEvent
  }
  async startEventForm(caseEventId, eventFormId):Promise<EventForm> {
    const eventFormResponse = new EventForm(UUID(), this.case._id, caseEventId, eventFormId)
    this
      .case
      .events
      .find(caseEvent => caseEvent.id === caseEventId)
      .eventForms
      .push(eventFormResponse)
    await this.save()
    return eventFormResponse
  }
}

export { CaseService }