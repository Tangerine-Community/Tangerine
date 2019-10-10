import { TestBed, inject } from '@angular/core/testing';

import { AuthenticationService } from './authentication.service';
import { UserService } from './user.service';
import { SharedModule } from '../shared.module';
import { AppModule } from 'src/app/app.module';

describe('AuthenticationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, AppModule]
    });
  });

  it('should be created', inject([AuthenticationService], (service: AuthenticationService) => {
    expect(service).toBeTruthy();
  }));
});
