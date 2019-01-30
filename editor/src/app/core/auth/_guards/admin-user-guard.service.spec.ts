import { TestBed, inject } from '@angular/core/testing';

import { AdminUserGuard } from './admin-user-guard.service';

describe('AdminUserGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminUserGuard]
    });
  });

  it('should be created', inject([AdminUserGuard], (service: AdminUserGuard) => {
    expect(service).toBeTruthy();
  }));
});
