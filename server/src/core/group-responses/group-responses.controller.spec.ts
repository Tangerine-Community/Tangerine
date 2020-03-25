import { Test, TestingModule } from '@nestjs/testing';
import { GroupResponsesController } from './group-responses.controller';

describe('GroupResponses Controller', () => {
  let controller: GroupResponsesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupResponsesController],
    }).compile();

    controller = module.get<GroupResponsesController>(GroupResponsesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
