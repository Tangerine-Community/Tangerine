import { Test, TestingModule } from '@nestjs/testing';
import { BulkSyncService } from './bulk-sync.service';

describe('BulkSyncService', () => {
  let service: BulkSyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BulkSyncService],
    }).compile();

    service = module.get<BulkSyncService>(BulkSyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
