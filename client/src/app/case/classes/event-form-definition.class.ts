export class EventFormDefinition {

  id:string
  formId:string
  name:string
  // @TODO: roles[string]
  forCaseRole:string
  // Wether or not multiple EventForm Instances can be created in the same EventForm for the same Participant.
  repeatable: boolean
  // Wether or not EventForm Instance is marked as required when created.
  required:boolean
  // Create an EventForm Instance when a qualifying participant is added or when parent CaseEvent is created.
  autoPopulate:boolean
  // @TODO Document.
  templateListItem:string
  templateListItemIcon:string
  templateListItemPrimary:string
  templateListItemSecondary:string
  // @TODO... These are strings? Shouldn't they be boolean? Also what's their default? 
  allowDeleteIfFormNotCompleted:string
  allowDeleteIfFormNotStarted:string

  constructor() {
  }
}