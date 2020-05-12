import {TangyFormResponseModel} from 'tangy-form/tangy-form-response-model.js'

export enum IssueStatus {
  Open='Open',
  Closed='Closed'
}

export class IssueEvent {
  id:string
  type:string
  userId:string
  date:number
  data:any
}

class Issue extends TangyFormResponseModel {
  
  _id: string
  label:string
  tags:Array<string>
  status:IssueStatus 
  events:Array<IssueEvent>
  caseId:string
  eventId:string
  eventFormId:string
  formResponseId:string
  type:string = 'issue'

  constructor(data?:any) {
    super()
    Object.assign(this, data)
  }

}

export { Issue }