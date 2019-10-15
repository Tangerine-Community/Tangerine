import { Case } from './case.class'
import { CaseDefinition } from './case-definition.class'
import { CaseEvent } from './case-event.class'
import { CaseEventDefinition } from './case-event-definition.class'

export const CASE_EVENT_STATUS_IN_PROGRESS = 'in-progress' 
export const CASE_EVENT_STATUS_COMPLETED = 'completed' 
export const CASE_EVENT_STATUS_REVIEWED = 'reviewed' 

class CaseEventInfo {

  caseEvent:CaseEvent
  caseDefinition:CaseDefinition
  caseEventDefinition:CaseEventDefinition
  caseInstance:Case

  getRouterPath() {
    return `/case/event/${this.caseInstance._id}/${this.caseEvent.id}`
  }

}

export { CaseEventInfo }