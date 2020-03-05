import { Test, TestingModule } from '@nestjs/testing';
import { SyncCustomService } from './sync-custom.service';

describe('SyncCustomService', () => {
  let service: SyncCustomService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SyncCustomService],
    }).compile();

    service = module.get<SyncCustomService>(SyncCustomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
