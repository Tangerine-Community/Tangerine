import { EventFormDefinition } from './event-form-definition.class'

class CaseEventDefinition {

  id:string
  name:string
  description:string
  repeatable:boolean
  required:boolean
  templateListItemIcon:string
  templateListItemPrimary:string
  templateListItemSecondary:string
  templateCaseEventListItemIcon:string
  templateCaseEventListItemPrimary:string
  templateCaseEventListItemSecondary:string
  templateEventFormListItemIcon:string
  templateEventFormListItemPrimary:string
  templateEventFormListItemSecondary:string
  estimatedTimeFromCaseOpening:number
  estimatedTimeWindow:number
  eventFormDefinitions:Array<EventFormDefinition> = []
  onEventOpen:string
  onEventClose:string
  onEventCreate:string

  constructor() {
  }

}

export { CaseEventDefinition }
