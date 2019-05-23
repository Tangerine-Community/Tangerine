import { TestBed } from '@angular/core/testing';

import { CasesService } from './cases.service';
import { UserService } from 'src/app/shared/_services/user.service';

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

describe('CasesService', () => {

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
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
    const result = await service.getEventsByDate('test', 5, 15, false)
    expect(result.length).toEqual(5)
  })

  it('should be give events by date with estimates excluded', async() => {
    const service:CasesService = TestBed.get(CasesService);
    const result = await service.getEventsByDate('test', 5, 15, true)
    expect(result.length).toEqual(1)
  })

});
