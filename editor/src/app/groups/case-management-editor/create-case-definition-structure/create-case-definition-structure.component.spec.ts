import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCaseDefinitionStructureComponent } from './create-case-definition-structure.component';

describe('CreateCaseDefinitionStructureComponent', () => {
  let component: CreateCaseDefinitionStructureComponent;
  let fixture: ComponentFixture<CreateCaseDefinitionStructureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateCaseDefinitionStructureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCaseDefinitionStructureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
