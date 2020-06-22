import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageGroupRolesPermissionsComponent } from './manage-group-roles-permissions.component';

describe('ManageGroupRolesPermissionsComponent', () => {
  let component: ManageGroupRolesPermissionsComponent;
  let fixture: ComponentFixture<ManageGroupRolesPermissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageGroupRolesPermissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageGroupRolesPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
