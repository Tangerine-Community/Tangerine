import { AppConfigService } from './../../shared/_services/app-config.service';
import { CaseRole } from './../classes/case-role.class';
import { CASE_EVENT_STATUS_COMPLETED, CASE_EVENT_STATUS_IN_PROGRESS } from './../classes/case-event.class';
import { TestBed } from '@angular/core/testing';

import { CaseService } from './case.service';
import { CaseDefinitionsService } from './case-definitions.service';
import { TangyFormService } from 'src/app/tangy-forms/tangy-form.service';
import { UserService } from 'src/app/shared/_services/user.service';
// NOTE: For some reason if this is WindowRef from the shared module, this fails to inject.
import { CaseDefinition } from '../classes/case-definition.class';
import { EventFormDefinition } from '../classes/event-form-definition.class';
import { CaseEventDefinition } from '../classes/case-event-definition.class';
import PouchDB from 'pouchdb';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { CaseParticipant } from '../classes/case-participant.class';
import moment from 'moment/src/moment';
class MockCaseDefinitionsService {
  async load() {
    return <Array<CaseDefinition>>[
      {
        'id': 'caseDefinition1',
        'formId': 'caseDefinition1Form',
        'name': 'Case Type 1',
        'description': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        'caseRoles': [
          <CaseRole>{
            id: 'role1',
            label: 'Role 1'
          },
          <CaseRole>{
            id: 'role2',
            label: 'Role 2'
          }
        ],
        'eventDefinitions': <Array<CaseEventDefinition>>[
          {
            'id': 'event-definition-screening',
            'name': 'Screening',
            'description': 'A screening.',
            'repeatable': false,
            'required': true,
            'estimatedTimeFromCaseOpening': 0,
            'estimatedTimeWindow': 0,
            'eventFormDefinitions': [
              <EventFormDefinition>{
                'id': 'event-form-1',
                'formId': 'form1',
                'forCaseRole': 'role1',
                'name': 'Form 1',
                'required': true,
                'repeatable': false
              },
              <EventFormDefinition>{
                'id': 'event-form-2',
                'formId': 'form2',
                'forCaseRole': 'role2',
                'name': 'Form 2',
                'required': true,
                'repeatable': false
              }
            ]
          },
          {
            'id': 'event-definition-first-visit',
            'name': 'First visit',
            'description': 'The first visit',
            'repeatable': false,
            'required': true,
            'estimatedTimeFromCaseOpening': 15552000000,
            'estimatedTimeWindow': 2592000000,
            'eventFormDefinitions': [
              <EventFormDefinition>{
                'id': 'event-form-1',
                'formId': 'form1',
                'forCaseRole': 'role1',
                'name': 'Form 1',
                'required': true,
                'repeatable': false
              },
              <EventFormDefinition>{
                'id': 'event-form-2',
                'formId': 'form2',
                'forCaseRole': 'role1',
                'name': 'Form 2 (repeatable)',
                'required': true,
                'repeatable': true 
              },
              <EventFormDefinition>{
                'id': 'event-form-3',
                'formId': 'form3',
                'forCaseRole': 'role1',
                'name': 'Form 3',
                'required': false,
                'repeatable': false 
              }
            ]
          },
          {
            'id': 'event-definition-repeatable-event',
            'name': 'A Repeatable Event',
            'description': 'A repeatable event.',
            'repeatable': true,
            'required': true,
            'estimatedTimeFromCaseOpening': 0,
            'estimatedTimeWindow': 0,
            'eventFormDefinitions': [
              <EventFormDefinition>{
                'id': 'event-form-1',
                'formId': 'form1',
                'forCaseRole': 'role1',
                'name': 'Form 1',
                'required': true,
                'repeatable': false
              }
            ]
          },
          {
            'id': 'event-definition-not-required-event',
            'name': 'A Event that is not require',
            'description': 'An event that is not required.',
            'repeatable': true,
            'required': false,
            'estimatedTimeFromCaseOpening': 0,
            'estimatedTimeWindow': 0,
            'eventFormDefinitions': [
              <EventFormDefinition>{
                'id': 'event-form-1',
                'formId': 'form1',
                'forCaseRole': 'role1',
                'name': 'Form 1',
                'required': true,
                'repeatable': false
              }
            ]
          }
        ]
      }
    ]
  }
}

class MockTangyFormService {

  response:any

  async getFormMarkup(formId) {
    return `
      <tangy-form id='caseDefinition1Form'>
        <tangy-form-item id='item1'>
          <tangy-input name='input1'></tangy-input>
        </tangy-form>
      </tangy-form>
    `
  }
  async saveResponse(response) {
    this.response = response
    ///
  }
  async getResponse(id) {
    return this.response
    ///
  }
}

class MockUserService {
  getCurrentUser() {
    return 'test'
  }
  getUserDatabase(username) {
    return new PouchDB('test')
  }
}

describe('CaseService', () => {

  let httpClient: HttpClient
  let httpTestingController: HttpTestingController 

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        { 
          provide: CaseDefinitionsService,
          useClass: MockCaseDefinitionsService
        },
        {
          provide: TangyFormService,
          useClass: MockTangyFormService
        },
        {
          provide: UserService,
          useClass: MockUserService
        },
        {
          provide: AppConfigService,
          useClass: AppConfigService 
        }
      ]
    })
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    const service: CaseService = TestBed.get(CaseService);
    expect(service).toBeTruthy();
  });

  it('should create a case' , async () => {
    const service: CaseService = TestBed.get(CaseService);
    await service.create('caseDefinition1')
    expect(service.case._id).toBeTruthy()
  })

  it('should set an event ocurred on date', async () => {
    const service: CaseService = TestBed.get(CaseService)
    await service.create('caseDefinition1')
    await service.createEvent('event-definition-first-visit')
    const timeInMs = new Date().getTime()
    const date = moment((new Date(timeInMs))).format('YYYY-MM-DD')
    service.setEventOccurredOn(service.case.events[0].id, timeInMs)
    expect(service.case.events[0].occurredOnDay).toEqual(date)
  })
  it('should set an event EstimatedDay date', async () => {
    const service: CaseService = TestBed.get(CaseService)
    await service.create('caseDefinition1')
    await service.createEvent('event-definition-first-visit')
    const timeInMs = new Date().getTime()
    const date = moment((new Date(timeInMs))).format('YYYY-MM-DD')
    service.setEventEstimatedDay(service.case.events[0].id, timeInMs)
    expect(service.case.events[0].estimatedDay).toEqual(date)
  })
  it('should set an event ScheduledDay date', async () => {
    const service: CaseService = TestBed.get(CaseService)
    await service.create('caseDefinition1')
    await service.createEvent('event-definition-first-visit')
    const timeInMs = new Date().getTime()
    const date = moment((new Date(timeInMs))).format('YYYY-MM-DD')
    service.setEventScheduledDay(service.case.events[0].id, timeInMs)
    expect(service.case.events[0].scheduledDay).toEqual(date)
  })
  it('should set an event Window period', async () => {
    const service: CaseService = TestBed.get(CaseService)
    await service.create('caseDefinition1')
    await service.createEvent('event-definition-first-visit')
    const windowStartDayTimeInMs = new Date().getTime()
    const windowEndDayTimeInMs = new Date().getTime()
    const windowStartDay = moment((new Date(windowStartDayTimeInMs))).format('YYYY-MM-DD')
    const windowEndDay = moment((new Date(windowEndDayTimeInMs))).format('YYYY-MM-DD')
    service.setEventWindow(service.case.events[0].id, windowStartDayTimeInMs, windowEndDayTimeInMs)
    expect(service.case.events[0].windowStartDay).toEqual(windowStartDay)
    expect(service.case.events[0].windowEndDay).toEqual(windowEndDay)
  })

  it('should create participant and create forms for existing events', async () => {
    const service: CaseService = TestBed.get(CaseService)
    await service.create('caseDefinition1')
    await service.createEvent('event-definition-screening', true)
    expect(service.case.events[0].eventForms.length).toEqual(0)
    const caseParticipant = await service.createParticipant('role1')
    expect(service.case.participants[0].id).toEqual(caseParticipant.id)
    expect(service.case.events[0].eventForms.length).toEqual(1)
  })

  it('should create CaseEvent and also create corresponding required EventForms for Participants', async() => {
    const service: CaseService = TestBed.get(CaseService);
    await service.create('caseDefinition1')
    const caseParticipant = await service.createParticipant('role1')
    await service.createEvent('event-definition-screening', true)
    expect(service.case.participants[0].id).toEqual(caseParticipant.id)
    expect(service.case.events[0].eventForms.length).toEqual(1)
  })

  it('CaseEvent should have status of comleted when all required forms are completed', async () => {
    const service: CaseService = TestBed.get(CaseService);
    await service.create('caseDefinition1')
    const caseParticipant = await service.createParticipant('role1')
    const caseParticipant2 = await service.createParticipant('role2')
    const caseEvent = await service.createEvent('event-definition-screening', true)
    expect(service.case.events[0].status).toEqual(CASE_EVENT_STATUS_IN_PROGRESS)
    for (const eventForm of service.case.events[0].eventForms) {
      service.markEventFormComplete(caseEvent.id, eventForm.id)
    }
    expect(service.case.events[0].status).toEqual(CASE_EVENT_STATUS_COMPLETED)
  })

});
