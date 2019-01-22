import { EventForm } from './event-form.class'

class CaseEvent {
  id?:string;
  name:string;
  caseEventDefinitionId:string; 
  eventForms?:Array<EventForm> = [];
  startDate:number;
  constructor(id, name, caseEventDefinitionId, eventForms?, startDate?) {
    this.id = id
    this.name = name
    this.caseEventDefinitionId = caseEventDefinitionId 
    this.eventForms = eventForms
      ? eventForms
      : this.eventForms
    this.startDate = startDate
      ? startDate
      : Date.now()
  }
}

export { CaseEvent }