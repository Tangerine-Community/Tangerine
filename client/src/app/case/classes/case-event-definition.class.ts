import { EventFormDefinition } from './event-form-definition.class'


interface CaseEventAccess {
  create:Array<string>
  read:Array<string>
  update:Array<string>
  delete:Array<string>
}

class CaseEventDefinition {

  id:string
  name:string
  eventFormDefinitions:Array<EventFormDefinition> = []
  access:CaseEventAccess
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

export { CaseEventDefinition, CaseEventAccess }
