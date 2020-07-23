import { diffType_EventForm_FormResponseIDCreated, DIFF_TYPE__EVENT_FORM__FORM_RESPONSE_ID_CREATED } from './diff-type--event-form--form-response-id-created';
import { Case } from 'src/app/case/classes/case.class';
import { CaseDefinition } from 'src/app/case/classes/case-definition.class';

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

  fit('should resolve merge', () => {
    const diffInfo = diffType_EventForm_FormResponseIDCreated.detect({
      a,
      b,
      diffs: [],
      caseDefinition
    })
    const mergeInfo = diffType_EventForm_FormResponseIDCreated.resolve({
      diffInfo,
      merged: a
    })
    expect(mergeInfo.diffInfo.diffs[0].resolved).toEqual(true)
    expect(mergeInfo.merged.events[0].eventForms.find(eventForm => eventForm.id === 'event-form-2').formResponseId).toEqual('form-response-2')
  })

})
