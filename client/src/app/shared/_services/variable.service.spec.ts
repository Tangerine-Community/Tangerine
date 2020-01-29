import { TestBed } from '@angular/core/testing';

import { VariableService } from './variable.service';

describe('VariableService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VariableService = TestBed.get(VariableService);
    expect(service).toBeTruthy();
  });
});
