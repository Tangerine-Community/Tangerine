import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociateUserProfileComponent } from './associate-user-profile.component';

describe('AssociateUserProfileComponent', () => {
  let component: AssociateUserProfileComponent;
  let fixture: ComponentFixture<AssociateUserProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociateUserProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociateUserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
