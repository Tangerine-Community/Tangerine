import { EventForm } from './event-form.class'

class CaseEvent {
  id?:string;
  complete:boolean = false
  name:string;
  caseEventDefinitionId:string; 
  eventForms?:Array<EventForm> = [];
  startDate:number;
  constructor(id, complete, name, caseEventDefinitionId, eventForms?, startDate?) {
    this.id = id
    this.name = name
    this.complete = complete
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