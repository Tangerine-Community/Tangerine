import { conflictType_EventForm_FormResponseIDCreated } from './conflict-type--event-form--form-response-id-created';
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

describe('ConflictResolver_EventFormResponseCreation', () => {

  fit('should detect conflict', () => {
    const conflictManifest = conflictType_EventForm_FormResponseIDCreated.detect({
      a,
      b,
      conflicts: [],
      merged: a,
      caseDefinition
    })
    expect(conflictManifest.conflicts.length).toEqual(1)
    expect(conflictManifest.conflicts[0].info.where).toEqual('b')
    expect(conflictManifest.conflicts[0].info.eventFormId).toEqual('event-form-2')
    expect(conflictManifest.conflicts[0].info.formResponseId).toEqual('form-response-2')
  })

})
