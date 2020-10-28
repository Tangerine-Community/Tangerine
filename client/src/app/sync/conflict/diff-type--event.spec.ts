import { Case } from 'src/app/case/classes/case.class';
import { CaseDefinition } from 'src/app/case/classes/case-definition.class';
import { diff } from './diff';
import { merge } from './merge';
import {DIFF_TYPE__EVENT, diffType_Event} from "./diff-type--event";
import {DIFF_TYPE__EVENT_FORM} from "./diff-type--event-form";
import * as moment from 'moment'

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
          }
        ]
      }
    ]
  }
}

describe('diffType_Event', () => {

  it('should detect difference with a new event', () => {
    const aCopy = JSON.parse(JSON.stringify(a))
    const bCopy = JSON.parse(JSON.stringify(b))
    const diffInfo = diffType_Event.detect({
      a:aCopy,
      b:{
        ...bCopy,
        events: [...bCopy.events,
          {
            id: 'event2',
            caseEventDefinitionId: 'event-definition-1',
            eventForms: [
              {
                id: 'event-form-2',
                "caseEventId": "event2",
                eventFormDefinitionId: 'event-form-definition-1',
                formResponseId: 'form-response-2'
              }
            ]
          }
        ]
      },
      diffs: [],
      caseDefinition
    })
    expect(diffInfo.diffs.length).toEqual(1)
    expect(diffInfo.diffs[0].type).toEqual(DIFF_TYPE__EVENT)
    expect(diffInfo.diffs[0].resolved).toEqual(false)
    expect(diffInfo.diffs[0].info.where).toEqual('b')
    expect(diffInfo.diffs[0].info.differences[0]).toEqual('new')
  })
  
  fit('should mark "a" doc as canonical', () => {
    const aCopy = JSON.parse(JSON.stringify(a))
    const bCopy = JSON.parse(JSON.stringify(b))
    const tangerineModifiedOn = moment().subtract(10, 'days').valueOf();
    let canonicalTimestamp = Date.now();
    const diffInfo = diffType_Event.detect({
      a:{
        ...aCopy,
        canonicalTimestamp: canonicalTimestamp
      },
      b:{
        ...bCopy,
        tangerineModifiedOn: tangerineModifiedOn,
        events: [...bCopy.events,
          {
            id: 'event2',
            caseEventDefinitionId: 'event-definition-1',
            eventForms: [
              {
                id: 'event-form-2',
                "caseEventId": "event2",
                eventFormDefinitionId: 'event-form-definition-1',
                formResponseId: 'form-response-2'
              }
            ]
          }
        ]
      },
      diffs: [],
      caseDefinition
    })
    if (diffInfo.a['canonicalTimestamp'] && !diffInfo.b['canonicalTimestamp']) {
        diffInfo.canonicalTimestampOverrideDoc = 'a'
    }
    expect(diffInfo.canonicalTimestampOverrideDoc).toEqual('a')
    expect(diffInfo.diffs.length).toEqual(1)
    expect(diffInfo.diffs[0].type).toEqual(DIFF_TYPE__EVENT)
    expect(diffInfo.diffs[0].resolved).toEqual(false)
    expect(diffInfo.diffs[0].info.where).toEqual('b')
    expect(diffInfo.diffs[0].info.differences[0]).toEqual('new')
  })
  
fit('should mark "b" doc as canonical', () => {
    const aCopy = JSON.parse(JSON.stringify(a))
    const bCopy = JSON.parse(JSON.stringify(b))
    const tangerineModifiedOn = moment().subtract(10, 'days').valueOf();
    let canonicalTimestamp = Date.now();
    const diffInfo = diffType_Event.detect({
      a:{
        ...aCopy,
        tangerineModifiedOn: tangerineModifiedOn,
      },
      b:{
        ...bCopy,
        canonicalTimestamp: canonicalTimestamp,
        events: [...bCopy.events,
          {
            id: 'event2',
            caseEventDefinitionId: 'event-definition-1',
            eventForms: [
              {
                id: 'event-form-2',
                "caseEventId": "event2",
                eventFormDefinitionId: 'event-form-definition-1',
                formResponseId: 'form-response-2'
              }
            ]
          }
        ]
      },
      diffs: [],
      caseDefinition
    })
    // if (diffInfo.a['canonicalTimestamp'] && !diffInfo.b['canonicalTimestamp']) {
    if (diffInfo.b['canonicalTimestamp'] > diffInfo.a['canonicalTimestamp'] || (diffInfo.b['canonicalTimestamp'] && !diffInfo.a['canonicalTimestamp'])) {
      diffInfo.canonicalTimestampOverrideDoc = 'b'
    }
    expect(diffInfo.canonicalTimestampOverrideDoc).toEqual('b')
    expect(diffInfo.diffs.length).toEqual(1)
    expect(diffInfo.diffs[0].type).toEqual(DIFF_TYPE__EVENT)
    expect(diffInfo.diffs[0].resolved).toEqual(false)
    expect(diffInfo.diffs[0].info.where).toEqual('b')
    expect(diffInfo.diffs[0].info.differences[0]).toEqual('new')
  })

  it('should resolve a difference that has a new event', () => {
    const aCopy = JSON.parse(JSON.stringify(a))
    const bCopy = JSON.parse(JSON.stringify(b))
    const mergeInfo = diffType_Event.resolve({
      merged: {...aCopy},
      diffInfo: {
        a:aCopy,
        b:{
          ...bCopy,
          events: [...bCopy.events,
            {
              id: 'event2',
              caseEventDefinitionId: 'event-definition-1',
              eventForms: [
                {
                  id: 'event-form-2',
                  "caseEventId": "event2",
                  eventFormDefinitionId: 'event-form-definition-1',
                  formResponseId: 'form-response-2'
                }
              ]
            }
          ]
        },
        diffs: [
          {
            "type": "DIFF_TYPE__EVENT",
            "resolved": false,
            "info": {
              "where": "b",
              "caseEventId": "event2",
              "differences": [
                "new"
              ],
              "newEvent": {
                "id": "event2",
                "caseEventDefinitionId": "event-definition-1",
                "eventForms": [
                  {
                    "id": "event-form-2",
                    "caseEventId": "event2",
                    "eventFormDefinitionId": "event-form-definition-1",
                    "formResponseId": "form-response-2"
                  }
                ]
              }
            }
          }
        ],
        caseDefinition
      }
    })
    expect(mergeInfo.merged.events.length).toEqual(2)
    expect(mergeInfo.merged.events[1].eventForms.length).toEqual(1)
    expect(mergeInfo.diffInfo.diffs[0].resolved).toEqual(true)
  })

})

describe('diff using diffType_Event scaffolding', () => {

  it('should detect difference', () => {
    const aCopy = JSON.parse(JSON.stringify(a))
    const bCopy = JSON.parse(JSON.stringify(b))
    const diffInfo = diff(aCopy,
      {
        ...bCopy,
        events: [...bCopy.events,
          {
            id: 'event2',
            caseEventDefinitionId: 'event-definition-1',
            eventForms: [
              {
                id: 'event-form-2',
                "caseEventId": "event2",
                eventFormDefinitionId: 'event-form-definition-1',
                formResponseId: 'form-response-2'
              }
            ]
          }
        ]
      },
      caseDefinition
    )
    expect(diffInfo.diffs.length).toEqual(2)
    expect(diffInfo.diffs[0].type).toEqual(DIFF_TYPE__EVENT)
    expect(diffInfo.diffs[1].type).toEqual(DIFF_TYPE__EVENT_FORM)
    expect(diffInfo.diffs[0].resolved).toEqual(false)
    expect(diffInfo.diffs[0].info.where).toEqual('b')
    expect(diffInfo.diffs[0].info.differences[0]).toEqual('new')
  })

})

describe('merge using diffType_Event scaffolding', () => {
  it('should resolve merge', () => {
    const aCopy = JSON.parse(JSON.stringify(a))
    const bCopy = JSON.parse(JSON.stringify(b))
    const mergeInfo = merge(
      {
        a:aCopy,
        b:{
          ...bCopy,
          events: [...bCopy.events,
            {
              id: 'event2',
              caseEventDefinitionId: 'event-definition-1',
              eventForms: [
                {
                  id: 'event-form-2',
                  "caseEventId": "event2",
                  eventFormDefinitionId: 'event-form-definition-1',
                  formResponseId: 'form-response-2'
                }
              ]
            }
          ]
        },
        diffs: [
          {
            "type": "DIFF_TYPE__EVENT",
            "resolved": false,
            "info": {
              "where": "b",
              "caseEventId": "event2",
              "differences": [
                "new"
              ],
              "newEvent": {
                "id": "event2",
                "caseEventDefinitionId": "event-definition-1",
                "eventForms": [
                  {
                    "id": "event-form-2",
                    "caseEventId": "event2",
                    "eventFormDefinitionId": "event-form-definition-1",
                    "formResponseId": "form-response-2"
                  }
                ]
              }
            }
          }
        ],
        caseDefinition
      }
    )
    expect(mergeInfo.merged.events.length).toEqual(2)
    expect(mergeInfo.merged.events[1].eventForms.length).toEqual(1)
    expect(mergeInfo.diffInfo.diffs[0].resolved).toEqual(true)
  })

})
