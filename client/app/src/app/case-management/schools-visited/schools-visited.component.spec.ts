import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SchoolsVisitedComponent } from './schools-visited.component';

describe('SchoolsVisitedComponent', () => {
  let component: SchoolsVisitedComponent;
  let fixture: ComponentFixture<SchoolsVisitedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SchoolsVisitedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SchoolsVisitedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
