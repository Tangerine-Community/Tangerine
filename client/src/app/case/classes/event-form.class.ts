class EventForm {
  id:string;
  eventFormDefinitionId:string;
  formResponseId?:string;
  participantId?:string
  access:EventFormAccess
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

interface EventFormAccess {
  create:Array<string>
  read:Array<string>
  update:Array<string>
  delete:Array<string>
}

export { EventForm }
