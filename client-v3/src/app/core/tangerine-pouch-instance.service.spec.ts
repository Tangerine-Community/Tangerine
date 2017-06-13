import { TestBed, inject } from '@angular/core/testing';

import { TangerinePouchInstanceService } from './tangerine-pouch-instance.service';

describe('TangerinePouchInstanceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TangerinePouchInstanceService]
    });
  });

  it('should be created', inject([TangerinePouchInstanceService], (service: TangerinePouchInstanceService) => {
    expect(service).toBeTruthy();
  }));
});
