import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventFormsForParticipantComponent } from './event-forms-for-participant.component';

describe('EventFormsForParticipantComponent', () => {
  let component: EventFormsForParticipantComponent;
  let fixture: ComponentFixture<EventFormsForParticipantComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventFormsForParticipantComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventFormsForParticipantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
