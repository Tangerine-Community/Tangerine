import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentGroupingReportComponent } from './student-grouping-report.component';

describe('StudentGroupingReportComponent', () => {
  let component: StudentGroupingReportComponent;
  let fixture: ComponentFixture<StudentGroupingReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentGroupingReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentGroupingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
