import { TestBed } from '@angular/core/testing';

import { MediaInputEditorService } from './media-input-editor.service';

describe('MediaInputEditorService', () => {
  let service: MediaInputEditorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaInputEditorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
