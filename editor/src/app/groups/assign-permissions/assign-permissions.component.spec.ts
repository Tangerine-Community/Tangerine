import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignPermissionsComponent } from './assign-permissions.component';

describe('AssignPermissionsComponent', () => {
  let component: AssignPermissionsComponent;
  let fixture: ComponentFixture<AssignPermissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssignPermissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignPermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
