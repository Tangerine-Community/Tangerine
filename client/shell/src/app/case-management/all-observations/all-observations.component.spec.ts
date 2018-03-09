import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllObservationsComponent } from './all-observations.component';

describe('CompletedObservationsComponent', () => {
  let component: AllObservationsComponent;
  let fixture: ComponentFixture<AllObservationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AllObservationsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllObservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
