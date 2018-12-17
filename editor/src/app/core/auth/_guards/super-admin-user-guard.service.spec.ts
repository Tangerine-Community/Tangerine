import { TestBed, inject } from '@angular/core/testing';

import { SuperAdminUserGuard } from './super-admin-user-guard.service';

describe('SuperAdminUserGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SuperAdminUserGuard]
    });
  });

  it('should be created', inject([SuperAdminUserGuard], (service: SuperAdminUserGuard) => {
    expect(service).toBeTruthy();
  }));
});
