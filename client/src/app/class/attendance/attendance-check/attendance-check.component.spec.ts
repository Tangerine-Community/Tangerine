import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceCheckComponent } from './attendance-check.component';

describe('AttendanceCheckComponent', () => {
  let component: AttendanceCheckComponent;
  let fixture: ComponentFixture<AttendanceCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttendanceCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
