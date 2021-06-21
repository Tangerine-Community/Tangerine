import { Test, TestingModule } from '@nestjs/testing';
import { BulkSyncController } from './bulk-sync.controller';
import {GroupDeviceService} from "../../../../shared/services/group-device/group-device.service";
import {SyncSessionService} from "../../services/sync-session/sync-session.service";
import {BulkSyncService} from "../../services/bulk-sync/bulk-sync.service";

class MockSyncSessionService { }
class MockGroupDeviceService { }
class MockBulkSyncService { }

describe('BulkSyncController', () => {
  let controller: BulkSyncController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GroupDeviceService,
          useClass: MockGroupDeviceService,
        },
        {
          provide: SyncSessionService,
          useClass: MockSyncSessionService
        },
        {
          provide: BulkSyncService,
          useClass: MockBulkSyncService
        }
      ],
      controllers: [BulkSyncController],
    }).compile();

    controller = module.get<BulkSyncController>(BulkSyncController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
