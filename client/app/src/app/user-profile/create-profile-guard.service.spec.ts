import { TestBed, inject } from '@angular/core/testing';

import { CreateProfileGuardService } from './create-profile-guard.service';
import { AppRoutingModule } from '../app-routing.module';
import { UserProfileModule } from './user-profile.module';

describe('CreateProfileGuardService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppRoutingModule, UserProfileModule]
    });
  });

  it('should be created', inject([CreateProfileGuardService], (service: CreateProfileGuardService) => {
    expect(service).toBeTruthy();
  }));
});
