import { CaseEvent } from './case-event.class'
import {TangyFormResponseModel} from 'tangy-form/tangy-form-response-model.js'
import { CaseParticipant } from './case-participant.class';
import { Notification } from './notification.class';

class Case extends TangyFormResponseModel {
  
  _id:string
  _rev:string
  type:string = 'case'
  caseDefinitionId:string
  events: Array<CaseEvent> = []
  openedDate?:number
  participants?:Array<CaseParticipant> = []
  disabledEventDefinitionIds?: Array<string> = []
  notifications?: Array<Notification> = []
  archived:boolean

  constructor(data?:any) {
    super()
    Object.assign(this, data)
  }
  
}

export { Case }