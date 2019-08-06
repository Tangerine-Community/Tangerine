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

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
