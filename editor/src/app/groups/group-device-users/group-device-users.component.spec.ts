import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupDeviceUsersComponent } from './group-device-users.component';

describe('GroupDeviceUsersComponent', () => {
  let component: GroupDeviceUsersComponent;
  let fixture: ComponentFixture<GroupDeviceUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupDeviceUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupDeviceUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
