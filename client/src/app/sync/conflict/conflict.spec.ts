import { DIFF_TYPE__EVENT_FORM__FORM_RESPONSE_ID_CREATED, diffType_EventForm_FormResponseIDCreated } from './diff-type--event-form--form-response-id-created';
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
            eventFormDefinitionId: 'event-form-definition-2'
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
            formResponseId: 'form-response-2'
          }
        ]
      }
    ]
  }
}



describe('diffType_EventForm_FormResponseIDCreated', () => {

  fit('should detect difference', () => {
    const diffInfo = diffType_EventForm_FormResponseIDCreated.detect({
      a,
      b,
      diffs: [],
      caseDefinition
    })
    expect(diffInfo.diffs.length).toEqual(1)
    expect(diffInfo.diffs[0].type).toEqual(DIFF_TYPE__EVENT_FORM__FORM_RESPONSE_ID_CREATED)
    expect(diffInfo.diffs[0].resolved).toEqual(false)
    expect(diffInfo.diffs[0].info.where).toEqual('b')
    expect(diffInfo.diffs[0].info.eventFormId).toEqual('event-form-2')
    expect(diffInfo.diffs[0].info.formResponseId).toEqual('form-response-2')
  })

  fit('should resolve', () => {
    const mergeInfo = diffType_EventForm_FormResponseIDCreated.resolve({
      merged: {...a},
      diffInfo: {
        a,
        b,
        diffs: [
          {
            type: DIFF_TYPE__EVENT_FORM__FORM_RESPONSE_ID_CREATED,
            resolved: false,
            info: {
              where: 'b',
              eventFormId: 'event-form-2',
              formResponseId: 'form-response-2'
            }
          }
        ],
        caseDefinition
      }
    })
    expect(mergeInfo.merged.events[0].eventForms[1].formResponseId).toEqual('form-response-2')
  })

})

describe('diff', () => {

  fit('should detect difference', () => {
    const diffInfo = diff(a, b, caseDefinition)
    expect(diffInfo.diffs.length).toEqual(1)
    expect(diffInfo.diffs[0].type).toEqual(DIFF_TYPE__EVENT_FORM__FORM_RESPONSE_ID_CREATED)
    expect(diffInfo.diffs[0].resolved).toEqual(false)
    expect(diffInfo.diffs[0].info.where).toEqual('b')
    expect(diffInfo.diffs[0].info.eventFormId).toEqual('event-form-2')
    expect(diffInfo.diffs[0].info.formResponseId).toEqual('form-response-2')
  })

})

describe('merge', () => {

  fit('should resolve merge', () => {
    const mergeInfo = merge(
      a,
      b,
      caseDefinition
    )
    expect(mergeInfo.merged.events[0].eventForms[1].formResponseId).toEqual('form-response-2')
  })

})