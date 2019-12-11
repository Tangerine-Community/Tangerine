import { HttpClientModule } from '@angular/common/http';
import { UnsanitizeHtmlPipe } from './../../../shared/_pipes/unsanitize-html.pipe';
import { CASE_EVENT_STATUS_IN_PROGRESS } from './../../classes/case-event.class';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseEventScheduleListComponent, CASE_EVENT_SCHEDULE_LIST_MODE_WEEKLY } from './case-event-schedule-list.component';
import { CasesService } from '../../services/cases.service';
import { CaseEventInfo } from '../../services/case-event-info.class';
import { SearchService } from 'src/app/shared/_services/search.service';
import { MockSearchService } from 'src/app/mocks/services/mock-search.service';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { MockTangyFormsInfoService } from 'src/app/mocks/services/mock-tangy-forms-info.service';
import { UserService } from 'src/app/shared/_services/user.service';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

class MockPouchDB {
  get(id) {
    switch (id) {
      case 'response1': 
        return {
          _id: 'response1',
          form: {
            id: 'form1'
          }
        }
      case 'response2':
        return {
          _id: 'response2',
          form: {
            id: 'form2'
          }
        }
    }
  }
}

class MockUserService {
  getCurrentUser() {
    return 'test-user'
  }
  getUserDatabase(username) {
    return new MockPouchDB()
  }
}

const REFERENCE_TIME = 1558715176000

class MockCasesService {
  
  async getEventsByDate(username: string, dateStart, dateEnd, excludeEstimates = false): Promise<Array<CaseEventInfo>> {
    const caseDefinition= {
      'id': 'c1',
      'formId': 'mother-manifest-3a453b',
      'name': 'Pregnant Woman',
      'description': 'Select this case type to screen, consent and enroll a pregnant womans.',
      'templateCaseTitle': '${getVariable("participant_id") ? `${getVariable("firstname")} ${getVariable("surname")}` : "..."}',
      'templateCaseDescription':
      '${getVariable("participant_id") ? `<b>Participant ID</b>: ${getVariable("participant_id")} <b>Village</b>: ${getVariable("village")} <b>Head of household</b>: ${getVariable("headofhouse")}` : "..."}',
      'templateScheduleListItemIcon': '${caseEventInfo.complete ? "event_available" : "event_note"}',
      'templateScheduleListItemPrimary': '<span>${caseEventDefinition.name}</span>',
      'templateScheduleListItemSecondary': '<span>${caseInstance.label}</span>',
    
      'templateCaseEventListItemIcon': '${caseEventInfo.complete ? "event_available" : "event_note"}',
      'templateCaseEventListItemPrimary': '<span>${caseEventDefinition.name}</span>',
      'templateCaseEventListItemSecondary':
        '${TRANSLATE("Scheduled")}: ${formatDate(caseEventInfo.dateStart,"dddd, MMMM Do YYYY, h:mm:ss a")}',
      'templateEventFormListItemIcon': '',
      'templateEventFormListItemPrimary': '<span>${eventFormDefinition.name}</span>',
      'templateEventFormListItemSecondary': 
      'Workflow: ${getValue("workflow_state")} Status: ${!eventForm.complete ? "Incomplete" : "Complete"}',
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
      <CaseEventInfo>{
        id: 'e1',
        caseId: 'response1',
        caseEventDefinitionId: 'c1',
        status: CASE_EVENT_STATUS_IN_PROGRESS,
        eventForms: [],
        estimate: false,
        scheduledDay: REFERENCE_TIME,
        occurredOnDay: REFERENCE_TIME,
        estimatedDay: REFERENCE_TIME,
        windowStartDay: REFERENCE_TIME,
        windowEndDay: REFERENCE_TIME + (1000 * 60 * 60),
        caseDefinition,
        caseInstance: {
          caseDefinitionId: 'c1',
          type: 'case',
          label: 'Pregnant Woman',
          collection: 'TangyFormResponse',
          events: <any> [
            {
              'id': '0ff22322-7734-4cc1-957d-dd25416a9413',
              'caseId': 'ff621529-d26b-42cc-a9a1-254179e75622',
              'status': 'in-progress',
              'name': 'ANC-Enrollment',
              'estimate': true,
              'scheduledDay': REFERENCE_TIME,
              'occurredOnDay': REFERENCE_TIME,
              'estimatedDay': REFERENCE_TIME,
              'windowStartDay': REFERENCE_TIME,
              'windowEndDay': REFERENCE_TIME + (1000 * 60 * 60),
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
describe("CaseEventScheduleListComponent", () => {
  let component: CaseEventScheduleListComponent;
  let fixture: ComponentFixture<CaseEventScheduleListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        HttpClientModule
      ],
      providers: [
        {
          provide: UserService,
          useClass: MockUserService
        },
        {
          provide: CasesService,
          useClass: MockCasesService
        },
        {
          provide: SearchService,
          useClass: MockSearchService
        },
        {
          provide: TangyFormsInfoService,
          useClass: MockTangyFormsInfoService
        }

      ],
      declarations: [
        UnsanitizeHtmlPipe,
        CaseEventScheduleListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseEventScheduleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /*
  it("should create', () => {
    expect(component).toBeTruthy();
  });

  it("should show day view', (done) => {
    expect(component).toBeTruthy();
    component.didSearch$.subscribe((value) => {
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll(".event-info").length).toEqual(1)
      done()
    })
    component.date = REFERENCE_TIME
  });

  it("should show week view', (done) => {
    expect(component).toBeTruthy();
    let i = 0
    component.didSearch$.subscribe((value) => {
      i++
      if (i === 2) {
        fixture.detectChanges()
        expect(fixture.nativeElement.querySelectorAll(".event-info").length).toEqual(1)
        expect(component.eventsInfo.length).toEqual(1)
        done()
      }
    })
    component.date = REFERENCE_TIME
    component.mode = CASE_EVENT_SCHEDULE_LIST_MODE_WEEKLY
  });
  */

});
