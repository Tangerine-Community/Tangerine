import { UserRole } from 'src/app/shared/_services/user.service'
import { EventFormDefinition } from './event-form-definition.class'


class CaseEventDefinition {

  id:string
  name:string
  eventFormDefinitions:Array<EventFormDefinition> = []
  permissions:CaseEventPermissions
  repeatable?:boolean = false
  required?:boolean = false
  templateListItemIcon?:string
  templateListItemPrimary?:string
  templateListItemSecondary?:string
  templateCaseEventListItemIcon?:string
  templateCaseEventListItemPrimary?:string
  templateCaseEventListItemSecondary?:string
  templateEventFormListItemIcon?:string
  templateEventFormListItemPrimary?:string
  templateEventFormListItemSecondary?:string
  constructor() {
  }

}

export enum CaseEventOperation {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete'
}

export interface CaseEventPermissions {
  [CaseEventOperation.CREATE]:Array<UserRole>
  [CaseEventOperation.READ]:Array<UserRole>
  [CaseEventOperation.UPDATE]:Array<UserRole>
  [CaseEventOperation.DELETE]:Array<UserRole>
}

export { CaseEventDefinition }
