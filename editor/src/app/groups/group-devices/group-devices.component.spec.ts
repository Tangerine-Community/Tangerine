import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupDevicesComponent } from './group-devices.component';

describe('GroupDevicesComponent', () => {
  let component: GroupDevicesComponent;
  let fixture: ComponentFixture<GroupDevicesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupDevicesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupDevicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
