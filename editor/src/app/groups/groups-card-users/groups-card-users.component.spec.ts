import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupsCardUsersComponent } from './groups-card-users.component';

describe('GroupsCardUsersComponent', () => {
  let component: GroupsCardUsersComponent;
  let fixture: ComponentFixture<GroupsCardUsersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupsCardUsersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupsCardUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
