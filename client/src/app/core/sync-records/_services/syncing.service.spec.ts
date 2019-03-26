import { TestBed, inject } from '@angular/core/testing';

import { SyncingService } from './syncing.service';
import { SyncRecordsModule } from '../sync-records.module';

describe('SyncingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SyncRecordsModule]
    });
  });

  it('should be created', inject([SyncingService], (service: SyncingService) => {
    expect(service).toBeTruthy();
  }));
});
