import { Test, TestingModule } from '@nestjs/testing';
import { BulkSyncController } from './bulk-sync.controller';

describe('BulkSyncController', () => {
  let controller: BulkSyncController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BulkSyncController],
    }).compile();

    controller = module.get<BulkSyncController>(BulkSyncController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
