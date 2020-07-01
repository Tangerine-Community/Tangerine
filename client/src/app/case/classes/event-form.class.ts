class EventForm {
  id:string;
  participantId:string
  complete:boolean = false
  required:boolean
  caseId:string; 
  caseEventId:string;
  eventFormDefinitionId:string;
  formResponseId:string;
  data?:any;
  constructor() {

  }
}

export { EventForm }