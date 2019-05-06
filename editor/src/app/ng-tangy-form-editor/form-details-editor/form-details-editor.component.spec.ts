import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormDetailsEditorComponent } from './form-details-editor.component';

describe('FormDetailsEditorComponent', () => {
  let component: FormDetailsEditorComponent;
  let fixture: ComponentFixture<FormDetailsEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormDetailsEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormDetailsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
