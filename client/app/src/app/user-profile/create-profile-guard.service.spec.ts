import { TestBed, inject } from '@angular/core/testing';

import { CreateProfileGuardService } from './create-profile-guard.service';

describe('CreateProfileGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CreateProfileGuardService]
    });
  });

  it('should be created', inject([CreateProfileGuardService], (service: CreateProfileGuardService) => {
    expect(service).toBeTruthy();
  }));
});
