import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupFormsEditComponent } from './group-forms-edit.component';

describe('GroupFormsEditComponent', () => {
  let component: GroupFormsEditComponent;
  let fixture: ComponentFixture<GroupFormsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupFormsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupFormsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
