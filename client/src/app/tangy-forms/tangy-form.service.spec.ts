import { TestBed } from '@angular/core/testing';

import { TangyFormService } from './tangy-form.service';

describe('TangyFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TangyFormService = TestBed.get(TangyFormService);
    expect(service).toBeTruthy();
  });
});
