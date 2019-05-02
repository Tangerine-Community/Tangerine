import { TestBed } from '@angular/core/testing';

import { FormTypesService } from './form-types.service';

describe('FormTypesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FormTypesService = TestBed.get(FormTypesService);
    expect(service).toBeTruthy();
  });
});
