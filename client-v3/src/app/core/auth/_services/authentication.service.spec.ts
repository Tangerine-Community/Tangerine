import { TestBed, inject } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { UserService } from './user.service';

describe('AuthenticationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthenticationService, UserService]
    });
  });

  it('should be created', inject([AuthenticationService], (service: AuthenticationService) => {
    expect(service).toBeTruthy();
  }));
});
