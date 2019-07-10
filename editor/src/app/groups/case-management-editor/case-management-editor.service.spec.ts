import { TestBed } from '@angular/core/testing';

import { CaseManagementEditorService } from './case-management-editor.service';

describe('CaseManagementEditorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CaseManagementEditorService = TestBed.get(CaseManagementEditorService);
    expect(service).toBeTruthy();
  });
});
