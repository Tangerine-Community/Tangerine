import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TangerineEditorFormEditorComponent } from './tangerine-editor-form-editor.component';

describe('TangerineEditorFormEditorComponent', () => {
  let component: TangerineEditorFormEditorComponent;
  let fixture: ComponentFixture<TangerineEditorFormEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TangerineEditorFormEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TangerineEditorFormEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
