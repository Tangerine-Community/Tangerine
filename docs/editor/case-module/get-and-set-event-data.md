For lack of a T.case.setEventData()/T.case.getEventData() API, use T.case.setVariable and T.case.getVariable with variable names that are namespaced using the Event ID.

```javascript
// 3 ingredients are needed to set an Event Variable.
const eventId = '123'
const variableName = 'foo'
const variableValue = 'bar'

// Set Event Variable.
T.case.setVariable(`${eventId}-${variableName}`, variableValue)

// Get Event Variable.
const shouldBeValueOfBar = T.case.getVariable(`${eventId}-${variableName}`)
```

There is an example in the `case-module` Content Set which consists of three parts:
- Event Definition with Event Form Definition referencing a Form that sets Event Data: https://github.com/Tangerine-Community/Tangerine/blob/master/content-sets/case-module/case-type-1.json#L159
- Form that sets Event Data: https://github.com/Tangerine-Community/Tangerine/blob/master/content-sets/case-module/template-event-listing/form.html#L5
- Template using Event Data: https://github.com/Tangerine-Community/Tangerine/blob/master/content-sets/case-module/case-type-1.json#L21
                                              
