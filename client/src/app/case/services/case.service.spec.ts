import { CASE_EVENT_STATUS_COMPLETED, CASE_EVENT_STATUS_IN_PROGRESS } from './../classes/case-event.class';
import { TestBed } from '@angular/core/testing';

import { CaseService } from './case.service';
import { CaseDefinitionsService } from './case-definitions.service';
import { TangyFormService } from 'src/app/tangy-forms/tangy-form.service';
import { UserService } from 'src/app/shared/_services/user.service';
// NOTE: For some reason if this is WindowRef from the shared module, this fails to inject.
import { WindowRef } from 'src/app/core/window-ref.service';
import { CaseDefinition } from '../classes/case-definition.class';
import { EventFormDefinition } from '../classes/event-form-definition.class';
import { CaseEventDefinition } from '../classes/case-event-definition.class';
import PouchDB from 'pouchdb';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';

class MockCaseDefinitionsService {
  async load() {
    return <Array<CaseDefinition>>[
      {
        "id": "caseDefinition1",
        "formId": "caseDefinition1Form",
        "name": "Case Type 1",
        "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
        "eventDefinitions": <Array<CaseEventDefinition>>[
          {
            "id": "event-definition-screening",
            "name": "Screening",
            "description": "A screening.",
            "repeatable": false,
            "required": true,
            "estimatedTimeFromCaseOpening": 0,
            "estimatedTimeWindow": 0,
            "eventFormDefinitions": [
              <EventFormDefinition>{
                "id": "event-form-1",
                "formId": "form1",
                "name": "Form 1",
                "required": true,
                "repeatable": false
              }
            ]
          },
          {
            "id": "event-definition-first-visit",
            "name": "First visit",
            "description": "The first visit",
            "repeatable": false,
            "required": true,
            "estimatedTimeFromCaseOpening": 15552000000,
            "estimatedTimeWindow": 2592000000,
            "eventFormDefinitions": [
              <EventFormDefinition>{
                "id": "event-form-1",
                "formId": "form1",
                "name": "Form 1",
                "required": true,
                "repeatable": false
              },
              <EventFormDefinition>{
                "id": "event-form-2",
                "formId": "form2",
                "name": "Form 2 (repeatable)",
                "required": true,
                "repeatable": true 
              },
              <EventFormDefinition>{
                "id": "event-form-3",
                "formId": "form3",
                "name": "Form 3",
                "required": false,
                "repeatable": false 
              }
            ]
          },
          {
            "id": "event-definition-repeatable-event",
            "name": "A Repeatable Event",
            "description": "A repeatable event.",
            "repeatable": true,
            "required": true,
            "estimatedTimeFromCaseOpening": 0,
            "estimatedTimeWindow": 0,
            "eventFormDefinitions": [
              <EventFormDefinition>{
                "id": "event-form-1",
                "formId": "form1",
                "name": "Form 1",
                "required": true,
                "repeatable": false
              }
            ]
          },
          {
            "id": "event-definition-not-required-event",
            "name": "A Event that is not require",
            "description": "An event that is not required.",
            "repeatable": true,
            "required": false,
            "estimatedTimeFromCaseOpening": 0,
            "estimatedTimeWindow": 0,
            "eventFormDefinitions": [
              <EventFormDefinition>{
                "id": "event-form-1",
                "formId": "form1",
                "name": "Form 1",
                "required": true,
                "repeatable": false
              }
            ]
          }
        ]
      }
    ]
  }
}

class MockTangyFormService {
  async getFormMarkup(formId) {
    return `
      <tangy-form id="caseDefinition1Form">
        <tangy-form-item id="item1">
          <tangy-input name="input1"></tangy-input>
        </tangy-form>
      </tangy-form>
    `
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
        // NOTE: For some reason if this is WindowRef from the shared module, this fails to inject.
        WindowRef,
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

  it('should schedule an event', async () => {
    const service: CaseService = TestBed.get(CaseService);
    await service.create('caseDefinition1')
    await service.createEvent('event-definition-first-visit')
    await service.scheduleEvent(service.case.events[0].id, 12345678)
    expect(service.case.events[0].dateStart).toEqual(12345678)
    expect(service.case.events[0].dateEnd).toEqual(12345678)
    expect(service.case.events[0].estimate).toEqual(false)
  })

  it('should create participant', async () => {
    const service: CaseService = TestBed.get(CaseService);
    await service.create('caseDefinition1')
    const caseParticipant = await service.createParticipant('role1')
    expect(service.case.participants[0].id).toEqual(caseParticipant.id)
 
  })

  it('should assign participant to role (and create forms for existing events?)')
  it('should create CaseEvent and also create corresponding required EventForms for Participants')
  it('should remove forms for participant upon unassignment')
  it('should change CaseEvent.status to "complete" when all required forms are completed for roles other than "reviewer".')
  it('should change CaseEvent.status to "reviewed" after reviewer role completes required forms in Event.')

  it('should create an event with required event forms', async () => {
    const service: CaseService = TestBed.get(CaseService);
    await service.create('caseDefinition1')
    await service.createEvent('event-definition-first-visit', true)
    expect(service.case.events[0].eventForms.length).toEqual(2)
  })

  it('CaseEvent should have status of comleted when all required forms are completed', async () => {
    const service: CaseService = TestBed.get(CaseService);
    await service.create('caseDefinition1')
    const caseEvent = await service.createEvent('event-definition-first-visit', true)
    expect(service.case.events[0].status).toEqual(CASE_EVENT_STATUS_IN_PROGRESS)
    for (let eventForm of service.case.events[0].eventForms) {
      service.markEventFormComplete(caseEvent.id, eventForm.id)
    }
    expect(service.case.events[0].status).toEqual(CASE_EVENT_STATUS_COMPLETED)
  })

});
