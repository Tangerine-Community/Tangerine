import { Test, TestingModule } from '@nestjs/testing';
import { StartSyncSessionController } from './start-sync-session.controller';

describe('StartSyncSession Controller', () => {
  let controller: StartSyncSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StartSyncSessionController],
    }).compile();

    controller = module.get<StartSyncSessionController>(StartSyncSessionController);
    debugger
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should start a sync session', () => {
    const response = controller.start('user1', 'group1')
    debugger
    expect(response.syncUrl).toBe('http://test:test@localhost/group/group1')
    expect(response.doc_ids.length).toBe(1)

  })

});
