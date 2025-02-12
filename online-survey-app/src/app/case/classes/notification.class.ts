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
  label:string
  description:string
  link:string
  icon:string
  color:string
  enforceAttention:boolean
  persist:boolean
  status:NotificationStatus 
  createdOn:number
  createdAppContext:AppContext
  constructor(data?:any) {
    Object.assign(this, data)
  }
}

export { Notification }