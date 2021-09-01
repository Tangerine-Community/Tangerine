export class EventFormDefinition {

  id:string
  formId:string
  name:string
  autoPopulate:boolean
  forCaseRole:string
  templateListItem:string
  repeatable: boolean
  required:boolean
  templateListItemIcon:string
  templateListItemPrimary:string
  templateListItemSecondary:string
  allowDeleteIfFormNotCompleted:string
  allowDeleteIfFormNotStarted:string

  constructor() {
  }
}