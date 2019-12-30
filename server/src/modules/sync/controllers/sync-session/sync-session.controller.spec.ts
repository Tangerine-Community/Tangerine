import { GroupDeviceService } from './../../../../shared/services/group-device/group-device.service';
import { Test, TestingModule } from '@nestjs/testing';
import { SyncSessionController } from './sync-session.controller';
import { SyncSessionService } from '../../services/sync-session/sync-session.service';

class MockSyncSessionController { }

class MockGroupDeviceService { }

describe('SyncSession Controller', () => {
  let controller: SyncSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GroupDeviceService,
          useClass: MockGroupDeviceService,
        },
        {
          provide: SyncSessionService,
          useClass: MockSyncSessionController
        }
      ],
      controllers: [SyncSessionController]
    }).compile();

    controller = module.get<SyncSessionController>(SyncSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
