import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgJsonFormComponent } from './ng-json-form.component';

describe('NgJsonFormComponent', () => {
  let component: NgJsonFormComponent;
  let fixture: ComponentFixture<NgJsonFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgJsonFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgJsonFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
