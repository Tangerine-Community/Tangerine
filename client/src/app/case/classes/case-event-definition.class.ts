import { EventFormDefinition } from './event-form-definition.class'

class CaseEventDefinition {

  id:string
  name:string
  eventFormDefinitions:Array<EventFormDefinition> = []
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

export { CaseEventDefinition }
