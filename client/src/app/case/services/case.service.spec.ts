import { TestBed } from '@angular/core/testing';

import { CaseService } from './case.service';

describe('CaseService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CaseService = TestBed.get(CaseService);
    expect(service).toBeTruthy();
  });
});
