# Case Module Cookbook

## Get data from participant related to current Event Form
In the following example, from an `on-change` hook or `on-open`, we can look up the corresponding participant for the current form, then look the `age` variable that has been previously set on that participant. 
```javascript
const currentEventId = window.location.hash.split('/')[5]
const currentFormId = window.location.hash.split('/')[6]
const participantId = caseService
  .case
  .events
  .find(event => event.id === currentEventId)
  .eventForms
  .find(eventForm => eventForm.id === currentFormId)
  .participantId
const age = caseService.getParticipantData(participantId, 'age')
```
