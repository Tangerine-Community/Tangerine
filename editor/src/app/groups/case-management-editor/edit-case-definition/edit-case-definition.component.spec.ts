import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCaseDefinitionComponent } from './edit-case-definition.component';

describe('EditCaseDefinitionComponent', () => {
  let component: EditCaseDefinitionComponent;
  let fixture: ComponentFixture<EditCaseDefinitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCaseDefinitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCaseDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
