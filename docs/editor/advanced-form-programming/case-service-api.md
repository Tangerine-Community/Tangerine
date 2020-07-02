# API: caseService
!!! warning
    Use of the caseService Class is only available when the case module is enabled on the server.
    
    ==TODO: Link to the page that describes how to enable the case service==

The caseService class allows the form developer to programmatically interact with the case from within the form. 

## Case Event Management

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

