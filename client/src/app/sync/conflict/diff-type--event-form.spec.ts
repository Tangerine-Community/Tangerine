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
            eventFormDefinitionId: 'event-form-definition-1',
            formResponseId: 'form-response-1'
          },
          {
            id: 'event-form-2',
            eventFormDefinitionId: 'event-form-definition-2',
            formResponseId: 'form-response-2',
            required: true
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
            eventFormDefinitionId: 'event-form-definition-1',
            formResponseId: 'form-response-1'
          },
          {
            id: 'event-form-2',
            eventFormDefinitionId: 'event-form-definition-2',
            formResponseId: 'form-response-2',
            required: true,
            complete: true
          }
        ]
      }
    ]
  }
}

describe('diffType_EventForm', () => {

  fit('should detect difference', () => {
    const diffInfo = diffType_EventForm.detect({
      a,
      b,
      diffs: [],
      caseDefinition
    })
    debugger;
    expect(diffInfo.diffs.length).toEqual(1)
    expect(diffInfo.diffs[0].type).toEqual(DIFF_TYPE__EVENT_FORM)
    expect(diffInfo.diffs[0].resolved).toEqual(false)
    expect(diffInfo.diffs[0].info.where).toEqual('b')
    expect(diffInfo.diffs[0].info.eventFormId).toEqual('event-form-2')
    expect(diffInfo.diffs[0].info.formResponseId).toEqual('form-response-2')
    expect(diffInfo.diffs[0].info.required).toEqual(true)
  })

  fit('should resolve', () => {
    const mergeInfo = diffType_EventForm.resolve({
      merged: {...a},
      diffInfo: {
        a,
        b,
        diffs: [
          {
            "type": "DIFF_TYPE__EVENT_FORM",
            "resolved": false,
            "info": {
              "where": "b",
              "eventFormId": "event-form-2",
              "formResponseId": "form-response-2",
              "required": true,
              "complete": true,
              "conflicts": [
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
    // expect(mergeInfo.diffInfo.diffs[0].required).toEqual(true)
  })

})

describe('diff using diffType_EventForm scaffolding', () => {

  it('should detect difference', () => {
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

  it('should resolve merge', () => {
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
              "eventFormId": "event-form-2",
              "formResponseId": "form-response-2",
              "required": true,
              "complete": true,
              "conflicts": [
                "complete"
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
