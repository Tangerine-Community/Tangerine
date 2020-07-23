import { ConflictResolverManifest } from './../../classes/conflict-resolver-manifest';
import { Case } from 'src/app/case/classes/case.class';
import { CaseDefinition } from 'src/app/case/classes/case-definition.class';
import { resolveEventFormResponseCreation } from './resolve-event-form-response-creation';

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

  fit('should resolve conflict', () => {
    const conflictResolverManifest = resolveEventFormResponseCreation({
      a,
      b,
      merged: a,
      caseDefinition
    })
    expect(conflictResolverManifest.merged.events[0].eventForms[1].formResponseId).toEqual('form-response-2')
  })

})
