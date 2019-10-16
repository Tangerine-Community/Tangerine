import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseEventsReviewListItemComponent } from './case-events-review-list-item.component';

describe('CaseEventsReviewListItemComponent', () => {
  let component: CaseEventsReviewListItemComponent;
  let fixture: ComponentFixture<CaseEventsReviewListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaseEventsReviewListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseEventsReviewListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
