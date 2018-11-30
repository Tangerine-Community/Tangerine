import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentProgressTableComponent } from './student-progress-table.component';

describe('StudentProgressTableComponent', () => {
  let component: StudentProgressTableComponent;
  let fixture: ComponentFixture<StudentProgressTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentProgressTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentProgressTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
