# Case Module Cookbook

## Get data of participant of current Event Form
In the following example, from an `on-change` hook or `on-open`, you can look up the corresponding particpant for that form and some variable set on that participant. In this case it's a custom `particpant_id` variable (not to be confused with the particpant's actual system ID).
```javascript
const currentEventId = window.location.hash.split('/')[5]
const currentFormId = window.location.hash.split('/')[6]
const participantId = caseService
  .case
  .events
  .find(event => event.id === currentEventId)
  .eventForms.find(eventForm => eventForm.id === currentFormId)
  .participantId
const participant_id = caseService.getParticipantData(participantId, 'participant_id')
```
