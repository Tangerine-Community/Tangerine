import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirectToDefaultRouteComponent } from './redirect-to-default-route.component';

describe('RedirectToDefaultRouteComponent', () => {
  let component: RedirectToDefaultRouteComponent;
  let fixture: ComponentFixture<RedirectToDefaultRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedirectToDefaultRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedirectToDefaultRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
