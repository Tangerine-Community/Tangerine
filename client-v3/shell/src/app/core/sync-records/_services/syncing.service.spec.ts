import { TestBed, inject } from '@angular/core/testing';

import { SyncingService } from './syncing.service';

describe('SyncingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SyncingService]
    });
  });

  it('should be created', inject([SyncingService], (service: SyncingService) => {
    expect(service).toBeTruthy();
  }));
});
