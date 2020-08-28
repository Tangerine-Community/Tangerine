import {
  DIFF_TYPE__EVENT_FORM,
  diffType_EventForm
} from './diff-type--event-form';
import { Case } from 'src/app/case/classes/case.class';
import { CaseDefinition } from 'src/app/case/classes/case-definition.class';
import { diff } from './diff';
import { merge } from './merge';
import {DIFF_TYPE__METADATA, diffType_Metadata} from "./diff-type--metadata";
import {EventForm} from "../../case/classes/event-form.class";

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

const a:any = {
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
    ],
    buildId: "buildId-1",
    deviceId: "deviceId-1",
    lastModified: "1597180087105",
    tangerineModifiedByDeviceId: "deviceId-1",
    tangerineModifiedByUserId: "userId-1",
    tangerineModifiedOn: "1597180087105"
  }
}

const b:any = {
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
    ],
    buildId: "buildId-2",
    deviceId: "deviceId-2",
    lastModified: "1598308639512",
    tangerineModifiedByDeviceId: "deviceId-2",
    tangerineModifiedByUserId: "userId-2",
    tangerineModifiedOn: "1598308639512"
  }
}

describe('diffType_EventForm', () => {

  it('should detect difference in 6 properties', () => {
    const aCopy = JSON.parse(JSON.stringify(a))
    const bCopy = JSON.parse(JSON.stringify(b))
    const diffInfo = diffType_Metadata.detect({
      a: aCopy,
      b: bCopy,
      diffs: [],
      caseDefinition
    })
    expect(diffInfo.diffs.length).toEqual(1)
    expect(diffInfo.diffs[0].type).toEqual(DIFF_TYPE__METADATA)
    expect(diffInfo.diffs[0].resolved).toEqual(false)
    expect(diffInfo.diffs[0].info.where).toEqual('a')
    expect(diffInfo.diffs[0].info.differences.length).toEqual(6)
  })

  fit('should resolve a difference that has a complete property', () => {
    const aCopy = JSON.parse(JSON.stringify(a))
    const bCopy = JSON.parse(JSON.stringify(b))
    const mergeInfo = diffType_Metadata.resolve({
      merged: {...aCopy},
      diffInfo: {
        a:aCopy,
        b:bCopy,
        diffs: [
          {
            "type": "DIFF_TYPE__METADATA",
            "resolved": false,
            "info": {
              "where": "a",
              "caseEventId": null,
              "formResponseId": null,
              "differences": [
                "buildId",
                "deviceId",
                "lastModified",
                "tangerineModifiedByDeviceId",
                "tangerineModifiedByUserId",
                "tangerineModifiedOn"
              ]
            }
          }
        ],
        caseDefinition
      }
    })
    expect(mergeInfo.merged.buildId).toEqual('buildId-2')
    expect(mergeInfo.merged.tangerineModifiedOn).toEqual('1598308639512')
    expect(mergeInfo.diffInfo.diffs[0].resolved).toEqual(true)
  })
})




