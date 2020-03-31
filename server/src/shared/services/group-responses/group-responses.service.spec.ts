import { Test, TestingModule } from '@nestjs/testing';
import { GroupResponsesService } from './group-responses.service';

describe('GroupResponsesService', () => {
  let service: GroupResponsesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GroupResponsesService],
    }).compile();

    service = module.get<GroupResponsesService>(GroupResponsesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
