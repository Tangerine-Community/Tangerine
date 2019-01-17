import UUID from 'uuid/v4';
import { CaseEvent } from './case-event.class'

class Case {
  _id:string;
  caseDefinitionId:string;
  events: Array<CaseEvent>
  constructor(caseDefinition) {
    this._id = UUID();
    debugger
    this.caseDefinitionId = caseDefinition.id;
  }

}

export { Case }