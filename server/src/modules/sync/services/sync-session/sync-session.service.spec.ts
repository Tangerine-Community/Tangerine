import { Test, TestingModule } from '@nestjs/testing';
import { SyncSessionService } from './sync-session.service';

describe('SyncSessionService', () => {
  let service: SyncSessionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SyncSessionService],
    }).compile();

    service = module.get<SyncSessionService>(SyncSessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
