import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthModule } from '../auth.module';
import { RegistrationComponent } from './registration.component';
import { Observable, of } from 'rxjs';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { WindowRef } from '../../window-ref.service';

describe('RegistrationComponent', () => {
  let component: RegistrationComponent;
  let fixture: ComponentFixture<RegistrationComponent>;
  const router = { navigate: jasmine.createSpy('navigate') };
  const snapshot = { queryParams: of({ returnUrl: 'create-nodes' }) };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AuthModule, SharedModule, AppRoutingModule],
      providers: [WindowRef]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
