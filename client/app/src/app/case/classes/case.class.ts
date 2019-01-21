import UUID from 'uuid/v4';
import { CaseEvent } from './case-event.class'

class Case {
  _id:string;
  _rev:string;
  caseDefinitionId:string;
  events: Array<CaseEvent> = [];
  collection:string = 'Case'
  constructor(data?:any) {
    if (!data) {
      this._id = UUID()
      return
    }
    this._id = data._id
    this._rev = data._rev
    this.caseDefinitionId = data.caseDefinitionId
    this.events = data.events.map(caseEventData => new CaseEvent(
      caseEventData.id,
      caseEventData.name,
      caseEventData.caseEventDefinitionId,
      caseEventData.eventForms
    ))
  }
}

export { Case }