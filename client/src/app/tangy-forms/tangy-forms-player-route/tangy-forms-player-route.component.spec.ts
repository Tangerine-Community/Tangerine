import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangyFormsPlayerRouteComponent } from './tangy-forms-player-route.component';

describe('TangyFormsPlayerRouteComponent', () => {
  let component: TangyFormsPlayerRouteComponent;
  let fixture: ComponentFixture<TangyFormsPlayerRouteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangyFormsPlayerRouteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangyFormsPlayerRouteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
