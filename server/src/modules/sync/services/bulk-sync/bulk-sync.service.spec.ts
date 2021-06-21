import { Test, TestingModule } from '@nestjs/testing';
import { BulkSyncService } from './bulk-sync.service';
import {GroupDeviceService} from "../../../../shared/services/group-device/group-device.service";
import {HttpService} from "@nestjs/common";

class MockHttpService { }

describe('BulkSyncService', () => {
  let service: BulkSyncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: HttpService,
          useClass: MockHttpService,
        },
        BulkSyncService 
        ],
    }).compile();

    service = module.get<BulkSyncService>(BulkSyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
