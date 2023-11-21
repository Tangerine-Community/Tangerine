import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceDashboardComponent } from './attendance-dashboard.component';

describe('AttendanceDashboardComponent', () => {
  let component: AttendanceDashboardComponent;
  let fixture: ComponentFixture<AttendanceDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttendanceDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
