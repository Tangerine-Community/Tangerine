import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginRemoteServerComponent } from './login-remote-server.component';

describe('LoginRemoteServerComponent', () => {
  let component: LoginRemoteServerComponent;
  let fixture: ComponentFixture<LoginRemoteServerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginRemoteServerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginRemoteServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
