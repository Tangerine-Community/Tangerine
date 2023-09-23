import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceScoresComponent } from './attendance-scores.component';

describe('AttendanceScoresComponent', () => {
  let component: AttendanceScoresComponent;
  let fixture: ComponentFixture<AttendanceScoresComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttendanceScoresComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceScoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
