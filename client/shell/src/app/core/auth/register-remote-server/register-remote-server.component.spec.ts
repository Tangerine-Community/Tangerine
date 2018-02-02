import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterRemoteServerComponent } from './register-remote-server.component';

describe('RegisterRemoteServerComponent', () => {
  let component: RegisterRemoteServerComponent;
  let fixture: ComponentFixture<RegisterRemoteServerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterRemoteServerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterRemoteServerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
