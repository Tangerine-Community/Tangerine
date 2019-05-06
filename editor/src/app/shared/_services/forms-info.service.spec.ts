import { TestBed } from '@angular/core/testing';

import { FormsInfoService } from './forms-info.service';

describe('FormsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FormsInfoService = TestBed.get(FormsInfoService);
    expect(service).toBeTruthy();
  });
});
