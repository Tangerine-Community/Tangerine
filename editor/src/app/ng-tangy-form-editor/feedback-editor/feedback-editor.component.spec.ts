import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackEditorComponent } from './feedback-editor.component';

describe('FormJsonEditorComponent', () => {
  let component: FeedbackEditorComponent;
  let fixture: ComponentFixture<FeedbackEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedbackEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
