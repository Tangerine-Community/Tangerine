import UUID from 'uuid/v4';

class CaseEvent {
  _id:string;
  constructor(caseDefinition) {
    this._id = UUID();
  }

}

export { CaseEvent }