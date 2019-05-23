import { EventForm } from './event-form.class'

class CaseEvent {
  id?:string;
  caseEventDefinitionId:string; 
  complete:boolean = false
  eventForms:Array<EventForm> = [];
  estimate = true
  dateStart:number
  dateEnd:number

  constructor() {

  }
}

export { CaseEvent }