import { EventForm } from './event-form.class'

class CaseEvent {
  id?: string
  caseId: string
  caseEventDefinitionId:string
  eventForms: Array<EventForm> = []
  complete:boolean = false
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
