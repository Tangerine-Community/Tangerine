import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskReportComponent } from './task-report.component';
import { ClassModule } from '../../class.module';
import { AppRoutingModule } from 'src/app/app-routing.module';

describe('TaskReportComponent', () => {
  let component: TaskReportComponent;
  let fixture: ComponentFixture<TaskReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[ClassModule, AppRoutingModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
