import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseEventScheduleComponent } from './case-event-schedule.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UserService } from 'src/app/shared/_services/user.service';
import { CasesService } from '../../services/cases.service';
import { SearchService } from 'src/app/shared/_services/search.service';
import { TangyFormsInfoService } from 'src/app/tangy-forms/tangy-forms-info-service';
import { CaseEventScheduleListComponent } from '../case-event-schedule-list/case-event-schedule-list.component';
import { MockSearchService } from 'src/app/mocks/services/mock-search.service';
import { MockTangyFormsInfoService } from 'src/app/mocks/services/mock-tangy-forms-info.service';
import { CaseEvent } from '../../classes/case-event.class';
import { MatFormFieldModule } from '@angular/material';

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

  async getEventsByDate (username:string, dateStart, dateEnd, excludeEstimates = false):Promise<Array<CaseEvent>> {
    return [
      <CaseEvent>{
        id: 'e1',
        caseId: 'response1',
        caseEventDefinitionId: 'c1',
        complete: false,
        eventForms: [],
        estimate: false,
        dateStart: REFERENCE_TIME,
        dateEnd: REFERENCE_TIME + (1000*60*60)
      },
      <CaseEvent>{
        id: 'e2',
        caseId: 'response1',
        caseEventDefinitionId: 'c1',
        complete: false,
        eventForms: [],
        estimate: false,
        dateStart: REFERENCE_TIME,
        dateEnd: REFERENCE_TIME + (1000*60*60)
      },
      <CaseEvent>{
        id: 'e3',
        caseId: 'response1',
        caseEventDefinitionId: 'c1',
        complete: false,
        eventForms: [],
        estimate: false,
        dateStart: REFERENCE_TIME + (1000*60*60*24),
        dateEnd: REFERENCE_TIME + (1000*60*60*24) + (1000*60*60)
      }
    ]
  }
}
describe('CaseEventScheduleComponent', () => {
  let component: CaseEventScheduleComponent;
  let fixture: ComponentFixture<CaseEventScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatFormFieldModule],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ CaseEventScheduleComponent, CaseEventScheduleListComponent ],
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
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseEventScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  fit('should create', (done) => {
    expect(component).toBeTruthy();
    component.didSearch$.subscribe((value) => {
      debugger
      //expect(component.listEl.nativeElement.querySelectorAll('.search-result').length).toEqual(3)
      //done()
    })
    component.date = REFERENCE_TIME

  }, 987654321);

});
