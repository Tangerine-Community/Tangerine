import { DbService } from './../db/db.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GroupDeviceService } from './group-device.service';

describe('GroupDeviceService', () => {
  let service: GroupDeviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupDeviceService, DbService],
    }).compile();

    service = module.get<GroupDeviceService>(GroupDeviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
