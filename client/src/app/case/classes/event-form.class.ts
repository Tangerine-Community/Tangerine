class EventForm {
  id:string;
  eventFormDefinitionId:string;
  formResponseId?:string;
  participantId?:string
  complete?:boolean = false
  required?:boolean = false
  caseId?:string; 
  caseEventId?:string;
  data?:any;
  constructor() {

  }
}

export { EventForm }