import { TestBed, inject, async } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoginGuard } from './login-guard.service';
import { SharedModule } from '../shared.module';

describe('LoginGuard', () => {
  const router = { navigate: jasmine.createSpy('navigate') };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule]
    }).compileComponents();
  }));
  it('should be created', inject([LoginGuard], (service: LoginGuard) => {
    expect(service).toBeTruthy();
  }));
});
