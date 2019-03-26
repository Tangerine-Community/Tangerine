import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedirectToDefaultRouteComponent } from './redirect-to-default-route.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { SharedModule } from '../../shared.module';

describe('RedirectToDefaultRouteComponent', () => {
  let component: RedirectToDefaultRouteComponent;
  let fixture: ComponentFixture<RedirectToDefaultRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AppRoutingModule, SharedModule]
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
