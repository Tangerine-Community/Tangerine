import { EventFormPermissions } from "./event-form-definition.class";

class EventForm {
  id:string;
  permissions:EventFormPermissions
  eventFormDefinitionId:string;
  formResponseId?:string;
  participantId?:string
  complete?:boolean = false
  required?:boolean = false
  caseId?:string;
  caseEventId?:string;
  data?:any;
  buildId?:string;
  deviceId?: string;
  lastModified?: string;
  tangerineModifiedByDeviceId?: string;
  tangerineModifiedByUserId?: string;
  tangerineModifiedOn?: string;

  constructor() {

  }
}

export { EventForm }
