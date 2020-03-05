import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicePasswordComponent } from './device-password.component';

describe('DevicePasswordComponent', () => {
  let component: DevicePasswordComponent;
  let fixture: ComponentFixture<DevicePasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevicePasswordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
