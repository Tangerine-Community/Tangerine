import {
  DIFF_TYPE__EVENT_FORM,
  diffType_EventForm
} from './diff-type--event-form';
import { Case } from 'src/app/case/classes/case.class';
import { CaseDefinition } from 'src/app/case/classes/case-definition.class';
import { diff } from './diff';
import { merge } from './merge';

const caseDefinition:CaseDefinition = {
  id: "test",
  formId: "test",
  name: "Test",
  eventDefinitions: [
    {
      id: 'event-definition-1',
      name: 'Event 1',
      eventFormDefinitions: [
        {
          id: 'event-form-definition-1',
          name: 'Event Form 1',
          formId: 'form-1'
        },
        {
          id: 'event-form-definition-2',
          name: 'Event Form 2',
          formId: 'form-2'
        }
      ]
    }
  ]
}

const a:Case = {
  ...new Case(),
  ...{
    caseDefinitionId: 'test',
    events: [
      {
        id: 'event1',
        caseEventDefinitionId: 'event-definition-1',
        eventForms: [
          {
            id: 'event-form-1',
            "caseEventId": "event1",
            eventFormDefinitionId: 'event-form-definition-1',
            formResponseId: 'form-response-1'
          },
          {
            id: 'event-form-2',
            "caseEventId": "event1",
            eventFormDefinitionId: 'event-form-definition-2',
          }
        ]
      }
    ]
  }
}

const b:Case = {
  ...new Case(),
  ...{
    caseDefinitionId: 'test',
    events: [
      {
        id: 'event1',
        caseEventDefinitionId: 'event-definition-1',
        eventForms: [
          {
            id: 'event-form-1',
            "caseEventId": "event1",
            eventFormDefinitionId: 'event-form-definition-1',
            formResponseId: 'form-response-1'
          },
          {
            id: 'event-form-2',
            "caseEventId": "event1",
            eventFormDefinitionId: 'event-form-definition-2',
            formResponseId: 'form-response-2'
          }
        ]
      }
    ]
  }
}

describe('diffType_EventForm', () => {

  it('should detect difference in formResponseId property', () => {
    const aCopy = JSON.parse(JSON.stringify(a))
    const bCopy = JSON.parse(JSON.stringify(b))
    const diffInfo = diffType_EventForm.detect({
      a:aCopy,
      b: {
        ...bCopy,
        events: bCopy.events.map(event => {
          return event.id === 'event1'
            ? {
              ...event,
                eventForms: event.eventForms.map(eventForm => {
                  return eventForm.id === 'event-form-2'
                    ? {
                      ...eventForm,
                        // complete: true
                      }
                    : eventForm
                })
              }
            : event
        })
      },
      diffs: [],
      caseDefinition
    })
    expect(diffInfo.diffs.length).toEqual(1)
    expect(diffInfo.diffs[0].type).toEqual(DIFF_TYPE__EVENT_FORM)
    expect(diffInfo.diffs[0].resolved).toEqual(false)
    expect(diffInfo.diffs[0].info.where).toEqual('b')
    expect(diffInfo.diffs[0].info.differences[0]).toEqual('formResponseId')
  })

  it('should detect 2 differences with formResponseId and complete properties', () => {
    const aCopy = JSON.parse(JSON.stringify(a))
    const bCopy = JSON.parse(JSON.stringify(b))
    const diffInfo = diffType_EventForm.detect({
      a:aCopy,
      b:{
        ...bCopy,
        events: bCopy.events.map(event => {
          return event.id === 'event1'
            ? {
              ...event,
              eventForms: event.eventForms.map(eventForm => {
                return eventForm.id === 'event-form-2'
                  ? {
                    ...eventForm,
                    formResponseId: 'form-response-2',
                    complete: true
                  }
                  : eventForm
              })
            }
            : event
        })
      },
      diffs: [],
      caseDefinition
    })
    expect(diffInfo.diffs.length).toEqual(1)
    expect(diffInfo.diffs[0].info.differences.length).toEqual(2)
    expect(diffInfo.diffs[0].type).toEqual(DIFF_TYPE__EVENT_FORM)
    expect(diffInfo.diffs[0].resolved).toEqual(false)
    expect(diffInfo.diffs[0].info.where).toEqual('b')
    expect(diffInfo.diffs[0].info.differences[0]).toEqual('formResponseId')
    expect(diffInfo.diffs[0].info.differences[1]).toEqual('complete')
  })

  it('should detect 2 differences with formResponseId and a new eventForm', () => {
    const aCopy = JSON.parse(JSON.stringify(a))
    const bCopy = JSON.parse(JSON.stringify(b))
    const diffInfo = diffType_EventForm.detect({
      a:aCopy,
      b:{
        ...bCopy,
        events: bCopy.events.map(event => {
          return event.id === 'event1'
            ? {
              ...event,
              eventForms: [...event.eventForms,
                {
                  id: 'event-form-3',
                  caseEventId: event.id,
                  eventFormDefinitionId: 'event-form-definition-3',
                  formResponseId: 'form-response-3'
                }
              ]

            }
            : event
        })
      },
      diffs: [],
      caseDefinition
    })
    expect(diffInfo.diffs.length).toEqual(2)
    expect(diffInfo.diffs[0].type).toEqual(DIFF_TYPE__EVENT_FORM)
    expect(diffInfo.diffs[0].resolved).toEqual(false)
    expect(diffInfo.diffs[0].info.where).toEqual('b')
    expect(diffInfo.diffs[0].info.differences[0]).toEqual('formResponseId')
    expect(diffInfo.diffs[1].info.differences[0]).toEqual('new')
    expect(diffInfo.diffs.length).toEqual(2)
  })

  it('should resolve a difference that has a complete property', () => {
    const aCopy = JSON.parse(JSON.stringify(a))
    const bCopy = JSON.parse(JSON.stringify(b))
    const mergeInfo = diffType_EventForm.resolve({
      merged: {...aCopy},
      diffInfo: {
        a:aCopy,
        b: {
          ...bCopy,
          events: bCopy.events.map(event => {
            return event.id === 'event1'
              ? {
                ...event,
                eventForms: event.eventForms.map(eventForm => {
                  return eventForm.id === 'event-form-2'
                    ? {
                      ...eventForm,
                      complete: true
                    }
                    : eventForm
                })
              }
              : event
          })
        },
        diffs: [
          {
            "type": "DIFF_TYPE__EVENT_FORM",
            "resolved": false,
            "info": {
              "where": "b",
              "caseEventId": "event1",
              "eventFormId": "event-form-2",
              "formResponseId": "form-response-2",
              "complete": true,
              "differences": [
                "complete"
              ]
            }
          }
        ],
        caseDefinition
      }
    })
    expect(mergeInfo.merged.events[0].eventForms[1].complete).toEqual(true)
    expect(mergeInfo.diffInfo.diffs[0].resolved).toEqual(true)
  })

  it('should resolve a difference that has a complete property and a new formResponse', () => {
    const aCopy = JSON.parse(JSON.stringify(a))
    const bCopy = JSON.parse(JSON.stringify(b))
    const mergeInfo = diffType_EventForm.resolve({
      merged: {...aCopy},
      diffInfo: {
        a:aCopy,
        b: {
          ...bCopy,
          events: bCopy.events.map(event => {
            return event.id === 'event1'
              ? {
                ...event,
                eventForms: [...event.eventForms.map(eventForm => {
                  return eventForm.id === 'event-form-2'
                    ? {
                      ...eventForm,
                      complete: true
                    }
                    : eventForm
                }), {
                  id: 'event-form-3',
                  caseEventId: event.id,
                  eventFormDefinitionId: 'event-form-definition-3',
                  formResponseId: 'form-response-3'
                }]
              }
              : event
          })
        },
        diffs: [
          {
            "type": "DIFF_TYPE__EVENT_FORM",
            "resolved": false,
            "info": {
              "where": "b",
              "caseEventId": "event1",
              "eventFormId": "event-form-2",
              "required": null,
              "complete": true,
              "differences": [
                "complete"
              ]
            }
          },
          {
            "type": "DIFF_TYPE__EVENT_FORM",
            "resolved": false,
            "info": {
              "where": "b",
              "caseEventId": "event1",
              "eventFormId": "event-form-3",
              "formResponseId": "form-response-3",
              "required": null,
              "complete": null,
              "differences": [
                "new"
              ]
            }
          }
        ],
        caseDefinition
      }
    })
    expect(mergeInfo.merged.events[0].eventForms[1].complete).toEqual(true)
    expect(mergeInfo.diffInfo.diffs[0].resolved).toEqual(true)
    expect(mergeInfo.merged.events[0].eventForms[2].formResponseId).toEqual('form-response-3')
    expect(mergeInfo.merged.events[0].eventForms.length).toEqual(3)
    expect(mergeInfo.diffInfo.diffs[1].resolved).toEqual(true)
  })

  it('should resolve a difference that has a new eventForm', () => {
    const aCopy = JSON.parse(JSON.stringify(a))
    const bCopy = JSON.parse(JSON.stringify(b))
    const mergeInfo = diffType_EventForm.resolve({
      merged: {...aCopy},
      diffInfo: {
        a:aCopy,
        b:{
          ...bCopy,
          events: bCopy.events.map(event => {
            return event.id === 'event1'
              ? {
                ...event,
                eventForms: [...event.eventForms,
                  {
                    id: 'event-form-3',
                    caseEventId: event.id,
                    eventFormDefinitionId: 'event-form-definition-3',
                    formResponseId: 'form-response-3'
                  }
                ]
              }
              : event
          })
        },
        diffs: [
          {
            "type": "DIFF_TYPE__EVENT_FORM",
            "resolved": false,
            "info": {
              "where": "b",
              "caseEventId": "event1",
              "eventFormId": "event-form-3",
              "formResponseId": "form-response-3",
              "required": null,
              "complete": null,
              "differences": [
                "new"
              ]
            }
          }
        ],
        caseDefinition
      }
    })
    expect(mergeInfo.merged.events[0].eventForms.length).toEqual(3)
    expect(mergeInfo.diffInfo.diffs[0].resolved).toEqual(true)
  })

  it('should resolve a difference that has two new eventForms', () => {
    const aCopy = JSON.parse(JSON.stringify(a))
    const bCopy = JSON.parse(JSON.stringify(b))
    const mergeInfo = diffType_EventForm.resolve({
      merged: {...aCopy},
      diffInfo: {
        a:aCopy,
        b:{
          ...bCopy,
          events: bCopy.events.map(event => {
            return event.id === 'event1'
              ? {
                ...event,
                eventForms: [...event.eventForms,
                  {
                    id: 'event-form-3',
                    caseEventId: event.id,
                    eventFormDefinitionId: 'event-form-definition-3',
                    formResponseId: 'form-response-3'
                  },
                  {
                    id: 'event-form-4',
                    caseEventId: event.id,
                    eventFormDefinitionId: 'event-form-definition-2',
                    formResponseId: 'form-response-4'
                  }
                ]
              }
              : event
          })
        },
        diffs: [
          {
            "type": "DIFF_TYPE__EVENT_FORM",
            "resolved": false,
            "info": {
              "where": "b",
              "caseEventId": "event1",
              "eventFormId": "event-form-3",
              "formResponseId": "form-response-3",
              "required": null,
              "complete": null,
              "differences": [
                "new"
              ]
            }
          },
          {
            "type": "DIFF_TYPE__EVENT_FORM",
            "resolved": false,
            "info": {
              "where": "b",
              "caseEventId": "event1",
              "eventFormId": "event-form-4",
              "formResponseId": "form-response-4",
              "required": null,
              "complete": null,
              "differences": [
                "new"
              ]
            }
          }
        ],
        caseDefinition
      }
    })
    expect(mergeInfo.merged.events[0].eventForms.length).toEqual(4)
    expect(mergeInfo.diffInfo.diffs[0].resolved).toEqual(true)
  })

})

describe('diff using diffType_EventForm scaffolding', () => {

  fit('should detect difference', () => {
    const diffInfo = diff(a, b, caseDefinition)
    expect(diffInfo.diffs.length).toEqual(1)
    expect(diffInfo.diffs[0].type).toEqual(DIFF_TYPE__EVENT_FORM)
    expect(diffInfo.diffs[0].resolved).toEqual(false)
    expect(diffInfo.diffs[0].info.where).toEqual('b')
    expect(diffInfo.diffs[0].info.eventFormId).toEqual('event-form-2')
    expect(diffInfo.diffs[0].info.formResponseId).toEqual('form-response-2')
  })

})

describe('merge using diffType_EventForm scaffolding', () => {
  fit('should resolve merge', () => {
    const mergeInfo = merge(
      {
        a,
        b,
        diffs: [
          {
            "type": "DIFF_TYPE__EVENT_FORM",
            "resolved": false,
            "info": {
              "where": "b",
              "caseEventId": "event1",
              "eventFormId": "event-form-2",
              "formResponseId": "form-response-2",
              "required": null,
              "complete": null,
              "differences": [
                "formResponseId"
              ]
            }
          }
        ],
        caseDefinition
    }
    )
    expect(mergeInfo.merged.events[0].eventForms[1].formResponseId).toEqual('form-response-2')
    expect(mergeInfo.diffInfo.diffs[0].resolved).toEqual(true)
  })

})
