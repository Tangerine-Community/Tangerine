import { Test, TestingModule } from '@nestjs/testing';
import { SyncSessionController } from './sync-session.controller';

describe('SyncSession Controller', () => {
  let controller: SyncSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SyncSessionController],
    }).compile();

    controller = module.get<SyncSessionController>(SyncSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
