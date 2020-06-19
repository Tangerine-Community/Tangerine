import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigureGroupSecurityComponent } from './configure-group-security.component';

describe('ConfigureGroupSecurityComponent', () => {
  let component: ConfigureGroupSecurityComponent;
  let fixture: ComponentFixture<ConfigureGroupSecurityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConfigureGroupSecurityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigureGroupSecurityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
