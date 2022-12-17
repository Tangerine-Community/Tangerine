import { TestBed } from '@angular/core/testing';

import { CasesService } from './cases.service';
import { HttpClientModule } from '@angular/common/http';
import { CaseEventInfo } from './case-event-info.class';
import {UserService} from "../../core/auth/_services/user.service";

class MockPouchDB {
  allDocs(options) {
    return {
      rows: [
        {
          _id: 'doc1',
          doc: {
            _id: 'doc1',
            collection: 'TangyFormResponse',
            type: 'case',
            events: [
              // Estimated lower bound overlap.
              {
                id: 'e1',
                estimate: true,
                dateStart: 1,
                dateEnd: 10
              },
              // Estimated in bounds.
              {
                id: 'e2',
                estimate: true,
                dateStart: 9,
                dateEnd: 11
              },
              // Estimated upper bounds overlap.
              {
                id: 'e3',
                estimate: true,
                dateStart: 10,
                dateEnd: 20
              },
              // Estimated full overlap.
              {
                id: 'e4',
                estimate: true,
                dateStart: 1,
                dateEnd: 20
              },
              // Estimated out of bounds.
              {
                id: 'e5',
                estimate: true,
                dateStart: 20,
                dateEnd: 30
              },
              // Scheduled in bounds.
              {
                id: 'e6',
                estimate: false,
                dateStart: 10,
                dateEnd: 10 
              },
              // Scheduled out of bounds.
              {
                id: 'e7',
                estimate: false,
                dateStart: 30,
                dateEnd: 30 
              },
            ]
          }
        }
      ]
    }
  }
}

class MockUserService {
  getCurrentUser() {
    return 'test'
  }
  getUserDatabase(username) {
    return new MockPouchDB()
  }
}

const REFERENCE_TIME = '2019-08-13'
const REFERENCE_TIME_2 = '2019-12-31'

class MockCasesService {
  
  async getEventsByDate(username: string, dateStart, dateEnd, excludeEstimates = false): Promise<Array<CaseEventInfo>> {
    const caseDefinition= {
      'id': 'c1',
      'formId': 'mother-manifest-3a453b',
      'name': 'Pregnant Woman',
      'description': 'Select this case type to screen, consent and enroll a pregnant womans.',
      'templateCaseTitle': '${getVariable("participant_id") ? `${getVariable("firstname")} ${getVariable("surname")}` : "..."}',
      'templateCaseDescription': '${getVariable("participant_id") ? `<b>Participant ID</b>: ${getVariable("participant_id")} <b>Village</b>: ${getVariable("village")} <b>Head of household</b>: ${getVariable("headofhouse")}` : "..."}',
      'templateScheduleListItemIcon': '${caseEventInfo.complete ? "event_available" : "event_note"}',
      'templateScheduleListItemPrimary': '<span>${caseEventDefinition.name}</span>',
      'templateScheduleListItemSecondary': '<span>${caseInstance.label}</span>',
    
      'templateCaseEventListItemIcon': '${caseEventInfo.complete ? "event_available" : "event_note"}',
      'templateCaseEventListItemPrimary': '<span>${caseEventDefinition.name}</span>',
      'templateCaseEventListItemSecondary': '${TRANSLATE("Scheduled")}: ${formatDate(caseEventInfo.dateStart,"dddd, MMMM Do YYYY, h:mm:ss a")}',
      'templateEventFormListItemIcon': '',
      'templateEventFormListItemPrimary': '<span>${eventFormDefinition.name}</span>',
      'templateEventFormListItemSecondary': 'Workflow: ${getValue("workflow_state")} Status: ${!eventForm.complete ? "Incomplete" : "Complete"}',
      'startFormOnOpen': {
        'eventId': 'c1',
        'eventFormId': 'event-form-definition-ece26e'
      },
      'eventDefinitions': [
        {
          'id': 'c1',
          'name': 'ANC-Enrollment',
          'description': '',
          'repeatable': false,
          'estimatedTimeFromCaseOpening': 0,
          'estimatedTimeWindow': 0,
          'required': true,
          'eventFormDefinitions': [
            {
              'id': 'event-form-definition-ece26e',
              'formId': 's0-participant-information-f254b9',
              'name': 'S01 - Screening and Enrollment',
              'required': true,
              'repeatable': false
            },
            {
              'id': 'event-form-definition-574497',
              'formId': 's02-drug-administration-99380a',
              'name': 'S02 - AZ dosing',
              'required': true,
              'repeatable': false
            },
            {
              'id': 'event-form-definition-c94289',
              'formId': 's03-demographic-characteristics-c09a84',
              'name': 'S03 - Demographic information',
              'required': true,
              'repeatable': false
            },
            {
              'id': 'event-form-definition-a5301b',
              'formId': 's04-current-pregnancy-record-and-pregnancy-history-9858d6',
              'name': 'S04 - Maternal Clinical history',
              'required': true,
              'repeatable': false
            },
            {
              'id': 'event-form-definition-c58ef3',
              'formId': 's05-maternal-physical-exam-1c983b',
              'name': 'S05 - Physical Exam',
              'required': true,
              'repeatable': false
            },
            {
              'id': 'event-form-definition-z830kj',
              'formId': 's06-current-anc-visit-68fc78',
              'name': 'S06 - Current ANC visit',
              'required': true,
              'repeatable': false
            },
            {
              'id': 'event-form-definition-z452kj',
              'formId': 's07-visit-information-82328c',
              'name': 'S07 - Visit Close Out',
              'required': true,
              'repeatable': false
            }
          ]
        },
      ]
    }
    return [
      <CaseEventInfo><unknown>{
        id: 'e1',
        caseId: 'response1',
        caseEventDefinitionId: 'c1',
        status: 'in-progress',
        eventForms: [],
        estimate: false,
        scheduledDay: REFERENCE_TIME,
        occurredOnDay: REFERENCE_TIME,
        estimatedDay: REFERENCE_TIME,
        windowStartDay: REFERENCE_TIME,
        windowEndDay: REFERENCE_TIME_2,
        caseDefinition,
        caseInstance: {
          caseDefinitionId: 'c1',
          type: 'case',
          label: 'Pregnant Woman',
          collection: 'TangyFormResponse',
          events: <any>[
            {
              'id': '0ff22322-7734-4cc1-957d-dd25416a9413',
              'caseId': 'ff621529-d26b-42cc-a9a1-254179e75622',
              'status': 'in-progress',
              'name': 'ANC-Enrollment',
              'estimate': true,
              'caseEventDefinitionId': 'c1',
              'scheduledDay': REFERENCE_TIME,
              'occurredOnDay': REFERENCE_TIME,
              'estimatedDay': REFERENCE_TIME,
              'windowStartDay': REFERENCE_TIME,
              'windowEndDay': REFERENCE_TIME_2,
              'eventForms': [
                {
                  'id': 'fb64d705-ee99-4a27-bbad-8349a0e8767d',
                  'complete': false,
                  'caseId': 'ff621529-d26b-42cc-a9a1-254179e75622',
                  'caseEventId': '0ff22322-7734-4cc1-957d-dd25416a9413',
                  'eventFormDefinitionId': 'event-form-definition-ece26e',
                  'formResponseId': '487517f7-0bec-4363-b22c-0c20090fe284'
                },
                {
                  'id': '83c502a2-8c82-4ed8-ad05-e8263cd56a0b',
                  'complete': false,
                  'caseId': 'ff621529-d26b-42cc-a9a1-254179e75622',
                  'caseEventId': '0ff22322-7734-4cc1-957d-dd25416a9413',
                  'eventFormDefinitionId': 'event-form-definition-574497',
                  'formResponseId': '3cd53c20-d213-4e8b-bf90-c7091bf95ad6'
                },
              ],
              'startDate': 0
            }
          ]
        }
      }
]}
}

describe('CasesService', () => {

  beforeEach(() => TestBed.configureTestingModule({
    imports:[HttpClientModule],
    providers: [
      {provide:CasesService, useClass:MockCasesService},
      {
        provide: UserService,
        useClass: MockUserService
      }
    ]
  }));

  it('should be created', () => {
    const service:CasesService = TestBed.get(CasesService);
    expect(service).toBeTruthy();
  });

  it('should be give events by date', async() => {
    const service:CasesService = TestBed.get(CasesService);
    const result = await service.getEventsByDate(5, 15, false)
    expect(result.length).toEqual(1)
  })

  it('should be give events by date with estimates excluded', async() => {
    const service:CasesService = TestBed.get(CasesService);
    const result = await service.getEventsByDate(5, 15, true)
    expect(result.length).toEqual(1)
  })

});
