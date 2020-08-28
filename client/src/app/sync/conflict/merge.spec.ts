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
            formResponseId: 'form-response-1',
            complete: false
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
            formResponseId: 'form-response-1',
            complete: true
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

// describe('merge', () => {
//
//   it('should resolve merge', () => {
//     const mergeInfo = merge(
//       {
//       a,
//         b,
//         diffs: [
//           {
//             "type": "DIFF_TYPE__EVENT_FORM__FORM_RESPONSE_ID_CREATED",
//             "resolved": false,
//             "info": {
//               "where": "b",
//               "eventFormId": "event-form-2",
//               "formResponseId": "form-response-2"
//             }
//           },
//           {
//             "type": "DIFF_TYPE__EVENT_FORM__COMPLETE",
//             "resolved": false,
//             "info": {
//               "where": "a",
//               "eventFormId": "event-form-1",
//               "formResponseId": "form-response-1",
//               "complete": false
//             }
//           }
//         ],
//         caseDefinition
//     }
//     )
//     expect(mergeInfo.merged.events[0].eventForms[1].formResponseId).toEqual('form-response-2')
//     expect(mergeInfo.diffInfo.diffs[0].resolved).toEqual(true)
//     expect(mergeInfo.merged.events[0].eventForms[1].complete).toEqual(true)
//     expect(mergeInfo.diffInfo.diffs[1].resolved).toEqual(true)
//   })
//
// })
