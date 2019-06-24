import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseManagementEditorComponent } from './case-management-editor.component';

describe('CaseManagementEditorComponent', () => {
  let component: CaseManagementEditorComponent;
  let fixture: ComponentFixture<CaseManagementEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaseManagementEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseManagementEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
