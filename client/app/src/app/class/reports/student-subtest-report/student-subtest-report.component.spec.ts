import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentSubtestReportComponent } from './student-subtest-report.component';
import { ClassModule } from '../../class.module';
import { AppRoutingModule } from 'src/app/app-routing.module';

describe('StudentSubtestReportComponent', () => {
  let component: StudentSubtestReportComponent;
  let fixture: ComponentFixture<StudentSubtestReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ClassModule, AppRoutingModule]
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
