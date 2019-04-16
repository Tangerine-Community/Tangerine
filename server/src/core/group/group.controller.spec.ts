import { Test, TestingModule } from '@nestjs/testing';
import { GroupController } from './group.controller';
import { SharedModule } from '../../shared/shared.module';

describe('Group Controller', () => {
  let controller: GroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [SharedModule],
      controllers: [GroupController]
    }).compile();
    controller = module.get<GroupController>(GroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
