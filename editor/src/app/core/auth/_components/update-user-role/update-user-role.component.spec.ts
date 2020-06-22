import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateUserRoleComponent } from './update-user-role.component';

describe('UpdateUserRoleComponent', () => {
  let component: UpdateUserRoleComponent;
  let fixture: ComponentFixture<UpdateUserRoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateUserRoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateUserRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
