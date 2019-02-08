import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormJsonEditorComponent } from './form-json-editor.component';

describe('FormJsonEditorComponent', () => {
  let component: FormJsonEditorComponent;
  let fixture: ComponentFixture<FormJsonEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormJsonEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormJsonEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
