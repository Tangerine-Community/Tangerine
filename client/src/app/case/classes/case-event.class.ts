import { EventForm } from './event-form.class'

class CaseEvent {
  id?: string
  caseEventDefinitionId:string
  eventForms: Array<EventForm> = []
  complete?:boolean = false
  caseId?: string
  // @TODO Remove estimate. Not used.
  estimate? = true
  estimatedDay?: string
  scheduledDay?: string
  windowStartDay?: string
  windowEndDay?: string
  occurredOnDay?: string

  constructor() {

  }
}

export { CaseEvent }
