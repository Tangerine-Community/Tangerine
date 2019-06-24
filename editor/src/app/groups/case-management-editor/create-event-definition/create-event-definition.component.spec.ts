import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEventDefinitionComponent } from './create-event-definition.component';

describe('CreateEventDefinitionComponent', () => {
  let component: CreateEventDefinitionComponent;
  let fixture: ComponentFixture<CreateEventDefinitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateEventDefinitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateEventDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
