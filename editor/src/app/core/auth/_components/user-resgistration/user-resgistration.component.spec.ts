import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UserResgistrationComponent } from './user-resgistration.component';

describe('UserResgistrationComponent', () => {
  let component: UserResgistrationComponent;
  let fixture: ComponentFixture<UserResgistrationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserResgistrationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserResgistrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
