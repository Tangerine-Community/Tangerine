import { TestBed, inject } from '@angular/core/testing';

import { CaseManagementService } from './case-management.service';

describe('CaseManagementService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CaseManagementService]
    });
  });

  it('should be created', inject([CaseManagementService], (service: CaseManagementService) => {
    expect(service).toBeTruthy();
  }));
});
