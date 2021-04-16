import { UserRole } from "src/app/shared/_services/user.service"

export class EventFormDefinition {

  id:string
  formId:string
  name:string
  permissions:EventFormPermissions
  /**
   * `forCaseRole` is a comma separated list of valid case roles
   * 1. empty role ""
   * 2. single role "role" 
   * 3. multiple roles "role1, role2,role3"
   */
  forCaseRole?:string = ''
  // Wether or not multiple EventForm Instances can be created in the same EventForm for the same Participant.
  repeatable?: boolean = false
  // Wether or not EventForm Instance is marked as required when created.
  required?:boolean = false
  // Create an EventForm Instance when a qualifying participant is added or when parent CaseEvent is created.
  autoPopulate?:boolean = false
  // @TODO Document.
  templateListItem?:string
  templateListItemIcon?:string
  templateListItemPrimary?:string
  templateListItemSecondary?:string
  // @TODO... These are strings? Shouldn't they be boolean? Also what's their default? 
  allowDeleteIfFormNotCompleted?:string
  allowDeleteIfFormNotStarted?:string

  constructor() {
  }
}

export enum EventFormOperation {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete'
}

export interface EventFormPermissions {
  [EventFormOperation.CREATE]:Array<UserRole>
  [EventFormOperation.READ]:Array<UserRole>
  [EventFormOperation.UPDATE]:Array<UserRole>
  [EventFormOperation.DELETE]:Array<UserRole>
}