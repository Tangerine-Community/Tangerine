import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupDeviceUserComponent } from './group-device-user.component';

describe('GroupDeviceUserComponent', () => {
  let component: GroupDeviceUserComponent;
  let fixture: ComponentFixture<GroupDeviceUserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupDeviceUserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupDeviceUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
