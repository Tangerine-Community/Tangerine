import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEventFormDefinitionComponent } from './create-event-form-definition.component';

describe('CreateEventFormDefinitionComponent', () => {
  let component: CreateEventFormDefinitionComponent;
  let fixture: ComponentFixture<CreateEventFormDefinitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateEventFormDefinitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEventFormDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
