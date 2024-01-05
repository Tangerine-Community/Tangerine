import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MediaInputEditorComponent } from './media-input-editor.component';

describe('MediaInputEditorComponent', () => {
  let component: MediaInputEditorComponent;
  let fixture: ComponentFixture<MediaInputEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MediaInputEditorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MediaInputEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
