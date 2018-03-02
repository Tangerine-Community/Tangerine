import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompletedObservationsComponent } from './completed-observations.component';

describe('CompletedObservationsComponent', () => {
  let component: CompletedObservationsComponent;
  let fixture: ComponentFixture<CompletedObservationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompletedObservationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompletedObservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
