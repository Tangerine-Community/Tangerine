import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentProgressTableComponent } from './student-progress-table.component';
import { ClassModule } from '../../class.module';

describe('StudentProgressTableComponent', () => {
  let component: StudentProgressTableComponent;
  let fixture: ComponentFixture<StudentProgressTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ClassModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentProgressTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /*
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  */
});
