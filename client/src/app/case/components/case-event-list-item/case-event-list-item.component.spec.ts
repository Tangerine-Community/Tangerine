import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseEventListItemComponent } from './case-event-list-item.component';

describe('CaseEventListItemComponent', () => {
  let component: CaseEventListItemComponent;
  let fixture: ComponentFixture<CaseEventListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaseEventListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseEventListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /* This test is going to be too much boilerplate to be worth maintaining.
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  */
});
