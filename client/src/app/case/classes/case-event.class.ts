import { EventForm } from './event-form.class'

class CaseEvent {
  id?: string
  caseId: string
  caseEventDefinitionId:string
  complete:boolean = false
  eventForms: Array<EventForm> = []
  // @TODO Remove estimate. Not used.
  estimate = true
  estimatedDay: string
  scheduledDay: string
  windowStartDay: string
  windowEndDay: string
  occurredOnDay: string

  name: string
  constructor() {

  }
}

export { CaseEvent }
