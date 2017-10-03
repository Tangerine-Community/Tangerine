import { TestBed, inject } from '@angular/core/testing';

import { TangerineFormSessionsService } from './tangerine-form-sessions.service';

describe('TangerineFormSessionsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TangerineFormSessionsService]
    });
  });

  it('should be created', inject([TangerineFormSessionsService], (service: TangerineFormSessionsService) => {
    expect(service).toBeTruthy();
  }));
});
