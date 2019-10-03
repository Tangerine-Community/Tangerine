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
  estimatedTimeFromCaseOpening:number
  estimatedTimeWindow:number
  eventFormDefinitions:Array<EventFormDefinition> = []
  constructor() {
  }

}

export { CaseEventDefinition }
