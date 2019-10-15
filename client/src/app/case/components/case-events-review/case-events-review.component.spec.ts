import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseEventsReviewComponent } from './case-events-review.component';

describe('CaseEventsReviewComponent', () => {
  let component: CaseEventsReviewComponent;
  let fixture: ComponentFixture<CaseEventsReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaseEventsReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseEventsReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
