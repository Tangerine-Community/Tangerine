import { TestBed, inject, async } from '@angular/core/testing';
import { Router } from '@angular/router';
import { UploadGuardService } from './upload-guard.service';
import { AuthenticationService } from '../_services/authentication.service';
import { UserService } from '../_services/user.service';
describe('UploadGuardService', () => {
  const router = { navigate: jasmine.createSpy('navigate') };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [AuthenticationService, UserService, UploadGuardService, { provide: Router, useValue: router }]
    });
  }));

  it('should be created', inject([UploadGuardService], (service: UploadGuardService) => {
    expect(service).toBeTruthy();
  }));
});
