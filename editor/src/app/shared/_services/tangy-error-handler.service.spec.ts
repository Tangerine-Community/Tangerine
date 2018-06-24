import { TestBed, inject } from '@angular/core/testing';

import { TangyErrorHandler } from './tangy-error-handler.service';

describe('TangyErrorHandler', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TangyErrorHandler]
    });
  });

  it('should be created', inject([TangyErrorHandler], (service: TangyErrorHandler) => {
    expect(service).toBeTruthy();
  }));
});
