import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewCaseComponent } from './new-case.component';

describe('NewCaseComponent', () => {
  let component: NewCaseComponent;
  let fixture: ComponentFixture<NewCaseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewCaseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewCaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
