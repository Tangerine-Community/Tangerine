import { CaseEvent } from './case-event.class'
import {TangyFormResponseModel} from 'tangy-form/tangy-form-response-model.js'
import { CaseParticipant } from './case-participant.class';

class Case extends TangyFormResponseModel {
  
  _id:string
  _rev:string
  caseDefinitionId:string
  label:string
  status:string
  openedDate:number
  participants:Array<CaseParticipant> = []
  disabledEventDefinitionIds: Array<string> = []
  events: Array<CaseEvent> = []
  type:string = 'case'

  constructor(data?:any) {
    super()
    Object.assign(this, data)
  }
  
}

export { Case }