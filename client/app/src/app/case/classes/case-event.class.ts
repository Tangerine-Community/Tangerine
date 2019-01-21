import { EventForm } from './event-form.class'

class CaseEvent {
  id?:string;
  name:string;
  caseEventDefinitionId:string; 
  eventForms?:Array<EventForm> = [];
  constructor(id, name, caseEventDefinitionId, eventFormResponses?) {
    this.id = id
    this.name = name
    this.caseEventDefinitionId = caseEventDefinitionId 
    this.eventForms = eventFormResponses
      ? eventFormResponses
      : this.eventForms
  }
}

export { CaseEvent }