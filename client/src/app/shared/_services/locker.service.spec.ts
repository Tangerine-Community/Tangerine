import { TestBed } from '@angular/core/testing';

import { LockerService } from './locker.service';

describe('LockerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LockerService = TestBed.get(LockerService);
    expect(service).toBeTruthy();
  });
});
