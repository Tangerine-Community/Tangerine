import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObservationsByLocationComponent } from './observations-by-location.component';

describe('CompletedObservationsComponent', () => {
  let component: ObservationsByLocationComponent;
  let fixture: ComponentFixture<ObservationsByLocationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ObservationsByLocationComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObservationsByLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
