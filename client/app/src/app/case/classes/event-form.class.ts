class EventForm {
  id:string;
  caseId:string; 
  caseEventId:string;
  eventFormDefinitionId:string;
  formResponseId:string;
  constructor(id, caseId, caseEventId, eventFormDefinitionId, formResponseId?) {
    this.id = id
    this.caseId = caseId
    this.caseEventId = caseEventId
    this.eventFormDefinitionId = eventFormDefinitionId
    this.formResponseId = formResponseId ? formResponseId : ''
  }
}

export { EventForm }