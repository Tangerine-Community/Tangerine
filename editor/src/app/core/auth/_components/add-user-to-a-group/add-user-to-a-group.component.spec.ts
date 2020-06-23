import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUserToAGroupComponent } from './add-user-to-a-group.component';

describe('AddUserToAGroupComponent', () => {
  let component: AddUserToAGroupComponent;
  let fixture: ComponentFixture<AddUserToAGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddUserToAGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddUserToAGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
