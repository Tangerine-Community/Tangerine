import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseNotificationsComponent } from './case-notifications.component';

describe('CaseNotificationsComponent', () => {
  let component: CaseNotificationsComponent;
  let fixture: ComponentFixture<CaseNotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaseNotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
