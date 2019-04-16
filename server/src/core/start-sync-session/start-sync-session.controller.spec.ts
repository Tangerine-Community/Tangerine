import { Test, TestingModule } from '@nestjs/testing';
import { StartSyncSessionController } from './start-sync-session.controller';
import { SharedModule } from '../../shared/shared.module';
import { GroupService } from '../../shared/services/group/group.service';
import { ClientUserService } from '../../shared/services/client-user/client-user.service';

class MockGroupService {
  getSyncUrl() { 
    return 'http://test:test@localhost/group/group1' 
  }
}
class MockClientUserService {
  getSyncDocIds() {
    return ['1']
  }
}

describe('StartSyncSession Controller', () => {
  let controller: StartSyncSessionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StartSyncSessionController],
      imports: [SharedModule],
      providers: [ 
        {
          provide: GroupService,
          useClass: MockGroupService
        },
        {
          provide: ClientUserService,
          useClass: MockClientUserService
        }
      ]
    }).compile();

    controller = module.get<StartSyncSessionController>(StartSyncSessionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should start a sync session', () => {
    const response = controller.start('user1', 'group1')
    expect(response.syncUrl).toBe('http://test:test@localhost/group/group1')
    expect(response.doc_ids.length).toBe(1)

  })

});
