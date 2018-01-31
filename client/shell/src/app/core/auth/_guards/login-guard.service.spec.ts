import { TestBed, inject, async } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoginGuard } from './login-guard.service';
import { AuthenticationService } from '../_services/authentication.service';
import { UserService } from '../_services/user.service';

describe('LoginGuard', () => {
  const router = { navigate: jasmine.createSpy('navigate') };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [AuthenticationService, LoginGuard, UserService, { provide: Router, useValue: router }]
    }).compileComponents();
  }));
  it('should be created', inject([LoginGuard], (service: LoginGuard) => {
    expect(service).toBeTruthy();
  }));
});
