import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentGroupingReportComponent } from './student-grouping-report.component';
import { ClassModule } from '../../class.module'
import { AppRoutingModule } from 'src/app/app-routing.module';

describe('StudentGroupingReportComponent', () => {
  let component: StudentGroupingReportComponent;
  let fixture: ComponentFixture<StudentGroupingReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ClassModule, AppRoutingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentGroupingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /*
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  */
});
