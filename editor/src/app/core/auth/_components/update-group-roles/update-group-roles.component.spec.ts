import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateGroupRolesComponent } from './update-group-roles.component';

describe('UpdateGroupRolesComponent', () => {
  let component: UpdateGroupRolesComponent;
  let fixture: ComponentFixture<UpdateGroupRolesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateGroupRolesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateGroupRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
