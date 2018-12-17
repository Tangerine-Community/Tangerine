import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSubtestReportComponent } from './student-subtest-report.component';

describe('StudentSubtestReportComponent', () => {
  let component: StudentSubtestReportComponent;
  let fixture: ComponentFixture<StudentSubtestReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentSubtestReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentSubtestReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
