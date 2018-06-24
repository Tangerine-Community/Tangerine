import { TestBed, inject } from '@angular/core/testing';

import { LoginGuard } from './login-guard.service';

describe('LoginGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoginGuard]
    });
  });

  it('should be created', inject([LoginGuard], (service: LoginGuard) => {
    expect(service).toBeTruthy();
  }));
});
