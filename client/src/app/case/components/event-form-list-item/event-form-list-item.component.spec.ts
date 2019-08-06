import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventFormListItemComponent } from './event-form-list-item.component';

describe('EventFormListItemComponent', () => {
  let component: EventFormListItemComponent;
  let fixture: ComponentFixture<EventFormListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventFormListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventFormListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
