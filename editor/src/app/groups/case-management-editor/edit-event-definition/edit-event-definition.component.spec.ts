import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEventDefinitionComponent } from './edit-event-definition.component';

describe('EditEventDefinitionComponent', () => {
  let component: EditEventDefinitionComponent;
  let fixture: ComponentFixture<EditEventDefinitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditEventDefinitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditEventDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
