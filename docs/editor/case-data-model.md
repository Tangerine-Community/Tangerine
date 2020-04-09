# Case Management Data Model

A [Case](../../client/src/app/case/classes/case.class.ts) is a collection of CaseEvents. A [CaseEvent](../../client/src/app/case/classes/case-event.class.ts) is configured by a CaseDefinition file, which can be used for different purposes such as following a participant in a drug trial over the course of many events.

A CaseEvent has a collection of [EventForms](../../client/src/app/case/classes/event-form.class.ts), which manage the relationship between  [Participant](../../client/src/app/case/classes/case-participant.class.ts) and  [TangyFormResponse](../../client/src/app/tangy-forms/tangy-form-response.class.ts) via participantId and formResponseId:

```json
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
```

The formResponseId links to a TangyFormResponse, which contains the data filled out in a form. A TangyFormResponse is a very generic container for data; it does not manage any of its relationships; instead, these relationships are managed in a TangyFormResponse whose `"type": "case"` inside the eventForms array. 

```json
"eventForms": [
        {
          "id": "c7b6ee21-793a-11ea-9144-710703689c79",
          "complete": true,
          "caseId": "c7b23330-793a-11ea-9144-710703689c79",
          "participantId": "",
          "caseEventId": "c7b6ee20-793a-11ea-9144-710703689c79",
          "eventFormDefinitionId": "enrollment-screening-form",
          "formResponseId": "c7b6ee22-793a-11ea-9144-710703689c79"
        },
        {
          "id": "c7b6ee23-793a-11ea-9144-710703689c79",
          "complete": true,
          "caseId": "c7b23330-793a-11ea-9144-710703689c79",
          "participantId": "8a46e841-d80c-4038-857c-7ae43c1d42cf",
          "caseEventId": "c7b6ee20-793a-11ea-9144-710703689c79",
          "eventFormDefinitionId": "mnh-sociodemographic-form",
          "formResponseId": "c7b6ee24-793a-11ea-9144-710703689c79"
        }
}
```

