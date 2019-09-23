import { EventForm } from './event-form.class'

class CaseEvent {
  id?:string
  caseId:string
  caseEventDefinitionId:string
  complete:boolean = false
  eventForms:Array<EventForm> = []
  estimate = true
  dateStart:number
  dateEnd:number
  name:string
  constructor() {

  }
}

export { CaseEvent }