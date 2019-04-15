import { TestBed, inject } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { UserService } from './user.service';
import { SharedModule } from '../shared.module';

describe('AuthenticationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule]
    });
  });

  it('should be created', inject([AuthenticationService], (service: AuthenticationService) => {
    expect(service).toBeTruthy();
  }));
});
