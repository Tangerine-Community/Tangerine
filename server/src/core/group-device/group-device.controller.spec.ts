import { DbService } from './../../shared/services/db/db.service';
import { GroupDeviceService } from './../../shared/services/group-device/group-device.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GroupDeviceController } from './group-device.controller';

describe('GroupDevice Controller', () => {
  let controller: GroupDeviceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupDeviceController],
      providers: [GroupDeviceService, DbService]
    }).compile();

    controller = module.get<GroupDeviceController>(GroupDeviceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
