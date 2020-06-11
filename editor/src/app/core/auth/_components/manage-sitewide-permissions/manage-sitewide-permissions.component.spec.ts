import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSitewidePermissionsComponent } from './manage-sitewide-permissions.component';

describe('ManageSitewidePermissionsComponent', () => {
  let component: ManageSitewidePermissionsComponent;
  let fixture: ComponentFixture<ManageSitewidePermissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageSitewidePermissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageSitewidePermissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
