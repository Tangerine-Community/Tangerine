import {TangyFormResponseModel} from 'tangy-form/tangy-form-response-model.js'

export enum IssueStatus {
  Open='Open',
  Closed='Closed'
}

export enum IssueEventType {
  Comment='Comment',
  FormResponseRevision='FormResponseRevision',
  FormResponseMerge='FormMerge'
}

export class IssueEvent {
  id:string
  type:IssueEventType
  userName:string
  userId:string
  date:number
  data:any
}

class Issue extends TangyFormResponseModel {
  
  _id: string
  userId:string
  label:string
  tags:Array<string>
  status:IssueStatus 
  events:Array<IssueEvent> = []
  caseId:string
  eventId:string
  eventFormId:string
  formResponseId:string
  type:string = 'issue'

  constructor(data?:any) {
    super()
    if (data.type !== 'issue') throw new Error('Passed in data of the wrong type. Expected an Issue.')
    Object.assign(this, data)
  }

}

export { Issue }