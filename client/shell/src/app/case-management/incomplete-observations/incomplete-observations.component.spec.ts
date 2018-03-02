import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IncompleteObservationsComponent } from './incomplete-observations.component';

describe('IncompleteObservationsComponent', () => {
  let component: IncompleteObservationsComponent;
  let fixture: ComponentFixture<IncompleteObservationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IncompleteObservationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IncompleteObservationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
