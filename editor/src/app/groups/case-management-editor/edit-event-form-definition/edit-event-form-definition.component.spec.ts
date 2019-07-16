import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEventFormDefinitionComponent } from './edit-event-form-definition.component';

describe('EditEventFormDefinitionComponent', () => {
  let component: EditEventFormDefinitionComponent;
  let fixture: ComponentFixture<EditEventFormDefinitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditEventFormDefinitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditEventFormDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
