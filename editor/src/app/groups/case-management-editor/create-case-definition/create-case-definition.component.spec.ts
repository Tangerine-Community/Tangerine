import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateCaseDefinitionComponent } from './create-case-definition.component';

describe('CreateCaseDefinitionComponent', () => {
  let component: CreateCaseDefinitionComponent;
  let fixture: ComponentFixture<CreateCaseDefinitionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateCaseDefinitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateCaseDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
