class EventForm {
  id:string;
  participantId:string
  complete:boolean = false
  caseId:string; 
  caseEventId:string;
  eventFormDefinitionId:string;
  formResponseId:string;
  data?:any;
  constructor() {

  }
}

export { EventForm }