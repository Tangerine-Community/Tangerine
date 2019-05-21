import { TestBed } from '@angular/core/testing';

import { CaseDefinitionsService } from './case-definitions.service';

describe('CaseDefinitionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CaseDefinitionsService = TestBed.get(CaseDefinitionsService);
    expect(service).toBeTruthy();
  });
});
