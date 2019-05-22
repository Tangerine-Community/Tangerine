import { EventForm } from './event-form.class'

class CaseEvent {
  id?:string;
  complete:boolean = false
  name:string;
  caseEventDefinitionId:string; 
  eventForms?:Array<EventForm> = [];
  scheduledDate:number
  startDate:number
  estimatedWindowStart:number
  estimatedWindowEnd:number
  constructor(
    id,
    complete = false,
    name,
    caseEventDefinitionId,
    estimatedWindowStart,
    estimatedWindowEnd,
    eventForms?,
    startDate?
  ) {
    this.id = id
    this.name = name
    this.complete = complete
    this.caseEventDefinitionId = caseEventDefinitionId 
    this.estimatedWindowEnd = estimatedWindowEnd
    this.estimatedWindowStart = estimatedWindowStart
    this.eventForms = eventForms
      ? eventForms
      : this.eventForms
    this.startDate = startDate
      ? startDate
      : Date.now()
  }
}

export { CaseEvent }