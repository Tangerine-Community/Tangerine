import { CaseEvent } from './case-event.class'
import {TangyFormResponseModel} from 'tangy-form/tangy-form-response-model.js'
import { CaseParticipant } from './case-participant.class';
import { Notification } from './notification.class';

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
  notifications: Array<Notification> = []
  type:string = 'case'
  archived:boolean
  
  constructor(data?:any) {
    super()
    Object.assign(this, data)
  }
  
}

export { Case }