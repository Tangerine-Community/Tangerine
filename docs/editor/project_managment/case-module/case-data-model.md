# Case Management Data Model

## Case Entities and Relationships:

Entities: Participant, Case, CaseEvent, EventForm, FormResponse

Relationships:

- A Case is related to many Participants. 
- A Case is related to many CaseEvents. 
- A CaseEvent is related to many EventForms. 
- An EventForm is related to one FormResponse. 
- An EventForm is related to one Participant.

Then there are definition Entities that are not in the data:

Entities: ParticipantDefinition, CaseDefinition, CaseEventDefinition, EventFormDefinition, FormDefinition

## How the Case Entities and Relationships are expressed in Tangerine 

A typical Tangerine Case will feature:
- one document (type = case) that has all of the Case-related meta-data mentioned below, and 
- multiple documents with forms data. These forms are linked by formResponseId in the case's eventForms array. 

There is not a 1-to-1 mapping between Tangerine entities and data persisted to the server. Records are saved in Tangerine as a [TangyFormResponse](../../client/src/app/tangy-forms/tangy-form-response.class.ts) doc, identified by `"collection": "TangyFormResponse"` in the Couchdb document. 

A TangyFormResponse is a very generic container for data; it does not by default manage any of its relationships. Most of the Case-related entities are saved in a single TangyFormResponse as  `"type": "case"` and explicitly manages these relationships inside the eventForms array:

```json
{
  "_id": "8744ff38-4c3e-487d-814d-ddcb916a41d5",
  "collection": "TangyFormResponse",
  "type": "case",
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
  ]
}
```
Any other documents related to a case save only form data and a small amount of meta-data.

## How relationships are mapped in an EventForm

Let's first look at the Case hierarchy: A [Case](../../client/src/app/case/classes/case.class.ts) has a collection of [CaseEvents](../../client/src/app/case/classes/case-event.class.ts). 

A CaseEvent has a collection of [EventForms](../../client/src/app/case/classes/event-form.class.ts), which manage the relationship between :
- the CaseEvent (stored as _id in the CaseEvent and caseId in the CaseEvent eventForms array )
- [Participant](../../client/src/app/case/classes/case-participant.class.ts) (stored in the CaseEvent's particiaptns array and also linked via participantId in the CaseEvent's eventForms's array)
- [CaseEvent](../../client/src/app/case/classes/case-event.class.ts) (stored as caseEventId in the CaseEvent's events array)
- [TangyFormResponse](../../client/src/app/tangy-forms/tangy-form-response.class.ts) (stored as formResponseId and available externally in a separate document)

```js
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

The formResponseId links to a TangyFormResponse, which contains the data filled out in a form. 
