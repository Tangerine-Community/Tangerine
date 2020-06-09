import { AppContext } from './../../app-context.enum';
export enum NotificationStatus {
  Open='Open',
  Closed='Closed'
}

export enum NotificationType {
  Critical='Critical',
  Info='Info',
}

class Notification {
  id: string
  userId:string
  userName:string
  label:string
  description:string
  status:NotificationStatus 
  caseId:string
  eventId:string
  eventFormId:string
  formResponseId:string
  createdOn:number
  createdAppContext:AppContext
  constructor(data?:any) {
    Object.assign(this, data)
  }
}

export { Notification }