# API: caseService
!!! warning
    Use of the caseService Class is only available when the case module is enabled on the server.
    
    ==TODO: Link to the page that describes how to enable the case service==

The caseService class allows the form developer to programmatically interact with the case from within the form. 

## Case APIs

---
### changeLocation

Change the location of a Case. This also changes the location information on all related Form Responses.

#### Parameters
| Param        | Type         | Description  |
| ------------ | ------------ | ------------ |
| location     | <code>object</code>   | An object where the properties are the levels and the values are the location node IDs |


#### Example
- [video](https://youtu.be/kqf63PGudwc)
- [example code](https://github.com/Tangerine-Community/Tangerine/blob/master/content-sets/case-module/change-location-of-case/form.html)


---
### setVariable 

Set a Case level variable in a Case. 

#### Parameters
| Param        | Type         | Description  |
| ------------ | ------------ | ------------ |
| variableName | <code>string</code> | The variable name. |
| value  | <code>any</code> | The value for the variable. |

#### Example
```javascript
caseService.setVariable('participant_id', getValue('participant_id'))
caseService.setVariable('first_name', getValue('first_name'))
caseService.setVariable('last_name', getValue('last_name'))
```
- [example code](https://github.com/Tangerine-Community/Tangerine/blob/master/content-sets/case-module/registration-role-1/form.html#L23)


---
### getVariable 

Get a Case level variable in a Case. 

#### Parameters
| Param        | Type         | Description  |
| ------------ | ------------ | ------------ |
| variableName | <code>string</code> | The variable name. |

#### Returns
The value requested. Many be any data type that was set

#### Example
```javascript
if (!caseService.getVariable('status')) {
  caseService.setVariable('status', 'screening')
}
```
- [example code](https://github.com/Tangerine-Community/Tangerine/blob/master/content-sets/case-module/registration-role-1/form.html#L4)


## Case Event API 

---
### createEvent

Dynamically create an instance of an event (defined in the case json) and add it to the current case

#### Parameters
| Param        | Type         | Description  |
| ------------ | ------------ | ------------ |
| eventDefinitionId                     | <code>string</code>   | Event Definition ID from the Case Definition Document |
| createRequiredEventForms (Optional)   | <code>boolean</code>  | (Default: False) Instantiate any required forms within the Event     |

#### Returns
[CaseEvent](https://github.com/Tangerine-Community/Tangerine/blob/master/client/src/app/case/classes/case-event.class.ts) <code>object</code>

#### Example
```typescript
const event1 = caseService.createEvent('event-definition-cf58ca')
const event2 = caseService.createEvent('event-definition-682ca6', true)
```

---
### setEventEstimatedDay

Set the **estimated** day of expected date completion. This is used by the calendar for displaying events. 
==TODO: Improve Description==

#### Parameters
| Param        | Type         | Description  |
| ------------ | ------------ | ------------ |
| eventId      | <code>string</code>   | (UUID) Event Instance ID from the Case |
| timeInMs     | <code>number</code>   | Unix timestamp for the event date/time    |

#### Example
```typescript
caseService.setEventEstimatedDay(event1.id, now)
caseService.setEventEstimatedDay('f9a25042-b03e-11ea-b3de-0242ac130004', 1592359411)
```

---
### setEventScheduledDay

Set the **scheduled** day of expected date completion. This is used by the calendar for displaying events. 
==TODO: Improve Description==

#### Parameters
| Param        | Type         | Description  |
| ------------ | ------------ | ------------ |
| eventId      | <code>string</code>   | (UUID) Event Instance ID from the Case |
| timeInMs     | <code>number</code>   | Unix timestamp for the event date/time    |

#### Example
```typescript
caseService.setEventScheduledDay(event1.id, now)
caseService.setEventScheduledDay('f9a25042-b03e-11ea-b3de-0242ac130004', 1592359411)
```

---
### setEventWindow

Set the expected event completion. 
==TODO: Improve Description==

#### Parameters
| Param        | Type         | Description  |
| ------------ | ------------ | ------------ |
| eventId                   | <code>string</code>   | (UUID) Event Instance ID from the Case |
| windowStartDayTimeInMs    | <code>number</code>   | Unix timestamp for the event **start** date/time    |
| windowEndDayTimeInMs      | <code>number</code>   | Unix timestamp for the event **end** date/time    |

#### Example
```typescript
caseService.setEventWindow(event1.id, 1592359411, 1592618611)
caseService.setEventWindow('f9a25042-b03e-11ea-b3de-0242ac130004', 1592359411, 1592618611)
```

---
### setEventOccurredOn

Set the date in which the event occurred 
==TODO: Improve Description==

#### Parameters
| Param        | Type         | Description  |
| ------------ | ------------ | ------------ |
| eventId      | <code>string</code>   | (UUID) Event Instance ID from the Case |
| timeInMs     | <code>number</code>   | Unix timestamp for the event completion date/time    |

#### Example
```typescript
caseService.setEventOccurredOn(event1.id, now)
caseService.setEventOccurredOn('f9a25042-b03e-11ea-b3de-0242ac130004', 1592359411)
```

### disableEventDefinition

Prevent creation of an via the new event menu.

#### Parameters
| Param        | Type         | Description  |
| ------------ | ------------ | ------------ |
| eventDefinitionId | <code>string</code> | (UUID) Event Definition ID from the Case Definition |

#### Example
```typescript
caseService.disableEventDefinition('event-definition-1')
```


## Event Form API

---
### createEventForm

Dynamically create an instance of an event form (defined in the case json) and add it to the current Case.

#### Parameters
| Param        | Type         | Description  |
| ------------ | ------------ | ------------ |
| caseEventId  | <code>string</code>   | Event ID of the Event you want to add this Form to |
| eventFormDefinitionId | <code>string</code>  | Event Form Definition ID of the Event Form ou want to create |
| participantId (optional)  | <code>string</code>   | ID of the Participant this Event Form is for. |

#### Returns
[EventForm](https://github.com/Tangerine-Community/Tangerine/blob/master/client/src/app/case/classes/event-form.class.ts) <code>object</code>

#### Example
```typescript
const eventForm = caseService.startEventForm(caseEvent.id, 'event-form-definition-fdkai3', participant.id)
```

- [code example](https://github.com/Tangerine-Community/Tangerine/blob/master/content-sets/case-module/create-an-urgent-notification/form.html#L5)
- [video demo](https://youtu.be/iw1emB9Ddis)


---
### deleteEventForm

Dynamically delete an instance of an event form.

#### Parameters
| Param        | Type         | Description  |
| ------------ | ------------ | ------------ |
| caseEventId  | <code>string</code>   | Event ID of the Event you want to add this Form to |
| eventFormId | <code>string</code>  | Event Form ID of the Event Form you want to delete |

#### Example
```javascript
// Find a Case Event and corresponding Event Form instance to delete.
const caseEvent = caseService
  .case
  .events
  .find(event => event.eventDefinitionId === 'event-definition-1')
const eventForm = caseEvent
  .eventForms
  .find(eventForm => eventForm.eventFormDefinitionId === 'event-form-definition-1')
// Delete the EventForm.
caseService.deleteEventForm(caseEvent.id, eventForm.id)
```

---
### setEventFormData

Set a custom piece of data for an event form. Note this is a separate data collection than the data on the Form Response related to the Event Form.

#### Parameters
| Param        | Type         | Description  |
| ------------ | ------------ | ------------ |
| caseEventId  | <code>string</code>   | Event ID of the Event the Event Form lives in |
| eventFormId | <code>string</code>  | Event Form ID of the Event Form you want to set data on |
| variableName | <code>string</code>  | Variable name you are setting |
| value | <code>any</code>  | Value you want to set |

#### Example
```javascript
caseService.setEventFormData(caseEvent.id, eventForm.id, 'foo', 'bar')
```

---
### getEventFormData

Get a custom piece of data for an event form. Note this is a separate data collection than the data on the Form Response related to the Event Form.

#### Parameters
| Param        | Type         | Description  |
| ------------ | ------------ | ------------ |
| caseEventId  | <code>string</code>   | Event ID of the Event the Event Form lives in |
| eventFormId | <code>string</code>  | Event Form ID of the Event Form you want to get data of |
| variableName | <code>string</code>  | Variable name you are getting |

#### Example
```javascript
const fooData = caseService.getEventFormData(caseEvent.id, eventForm.id, 'foo')
```

---
### markEventFormRequired 

Mark an Even Form instance as being required. You might do this on a form that was optional, but it has come to lite that it must be filled out before the event is marked as complete.

#### Parameters
| Param        | Type         | Description  |
| ------------ | ------------ | ------------ |
| caseEventId  | <code>string</code>   | Event ID of the Event the Event Form lives in |
| eventFormId | <code>string</code>  | Event Form ID of the Event Form you want to mark required |

#### Example
```javascript
// Create an EventForm in the current event. You could also find one.
const form2 = caseService.createEventForm(caseEvent.id, 'event-form--mark-form-as-required-example-2', participant.id)
// Mark EventForm as required.
caseService.markEventFormRequired(caseEvent.id, form2.id)
```

- [example code](https://github.com/Tangerine-Community/Tangerine/blob/release/v3.12.0/content-sets/case-module/mark-form-as-required-example--form-1/form.html#L6)
- [video](https://youtu.be/dnJk4LaGuQw)

---
### markEventFormNotRequired 

Mark and event form as not required.

#### Parameters
| Param        | Type         | Description  |
| ------------ | ------------ | ------------ |
| caseEventId  | <code>string</code>   | Event ID of the Event the Event Form lives in |
| eventFormId | <code>string</code>  | Event Form ID of the Event Form you want to mark not required |

#### Example
```javascript
// Mark EventForm as required.
caseService.markEventFormRequired(caseEvent.id, eventForm.id)
```


## Participant API

---
### createParticipant 

Create a participant in a Case.

#### Parameters
| Param        | Type         | Description  |
| ------------ | ------------ | ------------ |
| caseRoleId  | <code>string</code> | A Case Role ID as defined in the Case Role Definitions |

#### Returns
[Participant](https://github.com/Tangerine-Community/Tangerine/blob/master/client/src/app/case/classes/participant.class.ts) <code>object</code>

#### Example
```javascript
const participantRole1 = caseService.createParticipant('role-1')
```

- [example code](https://github.com/Tangerine-Community/Tangerine/blob/release/v3.12.0/content-sets/case-module/registration-role-1/form.html#L19)

---
### setParticipantData 

Set some data for a specific Participant.

#### Parameters
| Param        | Type         | Description  |
| ------------ | ------------ | ------------ |
| participantId  | <code>string</code> | ID of the participant |
| variableName | <code>string</code>  | Variable name you are setting |
| value | <code>any</code>  | Value you want to set |

#### Example

Create a participant and set some data from the current form...
```javascript
const participantRole1 = caseService.createParticipant('role-1')
caseService.setParticipantData(participantRole1.id, 'participant_id', getValue('participant_id'))
caseService.setParticipantData(participantRole1.id, 'first_name', getValue('first_name'))
caseService.setParticipantData(participantRole1.id, 'last_name', getValue('last_name'))
```

- [example code](https://github.com/Tangerine-Community/Tangerine/blob/release/v3.12.0/content-sets/case-module/registration-role-1/form.html#L19)

Set data on participant whom this Event Form is assigned to using the global `participant` object that is active when an EventForm is open that has an assigned Participant...
```javascript
caseService.setParticipantData(participant.id, 'first_name', getValue('first_name'))
caseService.setParticipantData(participant.id, 'last_name', getValue('last_name'))
```

- [example code](https://github.com/Tangerine-Community/Tangerine/blob/release/v3.12.0/content-sets/case-module/registration-role-2/form.html#L15)

Find a participant by role and set some data from the current form...
```javascript
const participantRole1 = caseService.case.participants.find(participant => paritipcant.caseRoleId === 'role-1')
caseService.setParticipantData(participantRole1.id, 'participant_id', getValue('participant_id'))
caseService.setParticipantData(participantRole1.id, 'first_name', getValue('first_name'))
caseService.setParticipantData(participantRole1.id, 'last_name', getValue('last_name'))
```


---
### getParticipantData 

Get some data for a specific Participant.

#### Parameters
| Param        | Type         | Description  |
| ------------ | ------------ | ------------ |
| participantId  | <code>string</code> | ID of the participant |
| variableName | <code>string</code>  | Variable name you are getting |

#### Returns
This function returns the value of the variable you requested which may consist of any data type you set it to.

#### Example

Get participant data of the form whom is assigned to the current form...
```javascript
caseService.getParticipantData(participant.id, 'first_name')
```

- [example code](https://github.com/Tangerine-Community/Tangerine/blob/9e5d2d55e17d122280769893fffc16470c916371/content-sets/case-module/registration-role-1/form.html#L40)
