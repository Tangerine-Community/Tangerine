import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventFormAddComponent } from './event-form-add.component';

describe('EventFormAddComponent', () => {
  let component: EventFormAddComponent;
  let fixture: ComponentFixture<EventFormAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventFormAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventFormAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /*
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  */
});
