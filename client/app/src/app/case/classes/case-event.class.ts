import UUID from 'uuid/v4';
import { TangyFormResponse } from '../../tangy-forms/tangy-form-response.class'

class CaseEvent {
  id:string;
  name:string;
  caseEventDefinitionId:string; 
  formResponses:Array<TangyFormResponse>;
  constructor(data?) {
    this.id = data.id
      ? data.id
      : UUID();
    this.caseEventDefinitionId = data.caseEventDefinitionId 
      ? data.caseEventDefinitionId
      : '';
    this.name = data.name ? data.name : ''
  }
}

export { CaseEvent }