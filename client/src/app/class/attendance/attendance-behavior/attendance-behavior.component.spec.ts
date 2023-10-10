import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceBehaviorComponent } from './attendance-behavior.component';

describe('AttendanceBehaviorComponent', () => {
  let component: AttendanceBehaviorComponent;
  let fixture: ComponentFixture<AttendanceBehaviorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttendanceBehaviorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceBehaviorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
