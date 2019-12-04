import { Test, TestingModule } from '@nestjs/testing';
import { SyncCustomController } from './sync-custom.controller';

describe('SyncCustom Controller', () => {
  let controller: SyncCustomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SyncCustomController],
    }).compile();

    controller = module.get<SyncCustomController>(SyncCustomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
