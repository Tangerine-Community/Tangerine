import { UserService } from './../user/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { TangerineConfigService } from '../tangerine-config/tangerine-config.service';

describe('GroupService', () => {
  let service: GroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupService, TangerineConfigService, UserService],
    }).compile();

    service = module.get<GroupService>(GroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
