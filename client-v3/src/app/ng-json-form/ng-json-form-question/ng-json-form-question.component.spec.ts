import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgJsonFormQuestionComponent } from './ng-json-form-question.component';

describe('NgJsonFormQuestionComponent', () => {
  let component: NgJsonFormQuestionComponent;
  let fixture: ComponentFixture<NgJsonFormQuestionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgJsonFormQuestionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgJsonFormQuestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
