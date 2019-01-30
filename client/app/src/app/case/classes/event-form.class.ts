class EventForm {
  id:string;
  complete:boolean = false
  caseId:string; 
  caseEventId:string;
  eventFormDefinitionId:string;
  formResponseId:string;
  constructor(id, complete, caseId, caseEventId, eventFormDefinitionId, formResponseId?) {
    this.id = id
    this.complete = complete
    this.caseId = caseId
    this.caseEventId = caseEventId
    this.eventFormDefinitionId = eventFormDefinitionId
    this.formResponseId = formResponseId ? formResponseId : ''
  }
}

export { EventForm }