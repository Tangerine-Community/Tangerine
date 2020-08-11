import { Case } from 'src/app/case/classes/case.class';
import { CaseDefinition } from 'src/app/case/classes/case-definition.class';
import { diff } from './diff';
import { merge } from './merge';
import {DIFF_TYPE__EVENT_FORM__COMPLETE, diffType_EventForm_Complete} from "./diff-type--event-form--complete";

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
            formResponseId: 'form-response-1',
            complete: false
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
            formResponseId: 'form-response-1',
            complete: true
          }
        ]
      }
    ]
  }
}



describe('diffType_EventForm_Complete', () => {

  fit('should detect difference', () => {
    const diffInfo = diffType_EventForm_Complete.detect({
      a,
      b,
      diffs: [],
      caseDefinition
    })
    expect(diffInfo.diffs.length).toEqual(1)
    expect(diffInfo.diffs[0].type).toEqual(DIFF_TYPE__EVENT_FORM__COMPLETE)
    expect(diffInfo.diffs[0].resolved).toEqual(false)
    expect(diffInfo.diffs[0].info.where).toEqual('a')
    expect(diffInfo.diffs[0].info.complete).toEqual(false)
  })

  fit('should resolve', () => {
    const mergeInfo = diffType_EventForm_Complete.resolve({
      merged: {...a},
      diffInfo: {
        a,
        b,
        diffs: [
          {
            type: DIFF_TYPE__EVENT_FORM__COMPLETE,
            resolved: false,
            info: {
              where: 'b',
              eventFormId: 'event-form-1',
              formResponseId: 'form-response-1',
              complete: true
            }
          }
        ],
        caseDefinition
      }
    })
    expect(mergeInfo.diffInfo.diffs[0].info.complete).toEqual(true)
    expect(mergeInfo.diffInfo.diffs[0].resolved).toEqual(true)
  })

})

describe('diff', () => {

  fit('should detect difference', () => {
    const diffInfo = diff(a, b, caseDefinition)
    expect(diffInfo.diffs.length).toEqual(1)
    expect(diffInfo.diffs[0].type).toEqual(DIFF_TYPE__EVENT_FORM__COMPLETE)
    expect(diffInfo.diffs[0].resolved).toEqual(false)
    expect(diffInfo.diffs[0].info.where).toEqual('a')
    expect(diffInfo.diffs[0].info.complete).toEqual(false)
  })

})

describe('merge', () => {

  fit('should resolve merge', () => {
    const mergeInfo = merge({
        a,
        b,
        diffs: [
          {
            type: DIFF_TYPE__EVENT_FORM__COMPLETE,
            resolved: false,
            info: {
              where: 'b',
              eventFormId: 'event-form-1',
              formResponseId: 'form-response-1',
              complete: true
            }
          }
        ],
        caseDefinition
      })
    expect(mergeInfo.diffInfo.diffs[0].info.complete).toEqual(true)
    expect(mergeInfo.diffInfo.diffs[0].resolved).toEqual(true)
  })

})
