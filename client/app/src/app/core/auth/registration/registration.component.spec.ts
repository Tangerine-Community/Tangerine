import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthModule } from '../auth.module';
import { RegistrationComponent } from './registration.component';
import { Observable } from 'rxjs/Observable';

describe('RegistrationComponent', () => {
  let component: RegistrationComponent;
  let fixture: ComponentFixture<RegistrationComponent>;
  const router = { navigate: jasmine.createSpy('navigate') };
  const snapshot = { queryParams: Observable.of({ returnUrl: 'create-nodes' }) };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AuthModule],
      providers: [{ provide: ActivatedRoute, useValue: { snapshot } }, { provide: Router, useValue: router }]
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
