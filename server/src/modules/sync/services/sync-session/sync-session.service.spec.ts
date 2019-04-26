import { Test, TestingModule } from '@nestjs/testing';
import { SyncSessionService } from './sync-session.service';
import { SharedModule } from '../../../../shared/shared.module';
import { GroupService } from '../../../../shared/services/group/group.service';
import { ClientUserService } from '../../../../shared/services/client-user/client-user.service';
import { HttpModule, HttpService } from '@nestjs/common';
import { TangerineConfigService } from '../../../../shared/services/tangerine-config/tangerine-config.service';
import { of } from 'rxjs';
import { DbService } from '../../../../shared/services/db/db.service';

class MockGroupService {
  read(groupId:string) {
    return {
      config: {
        sync: {
          formIds: [ 'example' ]
        }
      }
    }
  }
}

class MockClientUserService {
  getSyncDocIds() {
    return ['1']
  }
}

class MockHttpService {
  post(url, data) {
    return of('')
  }
}

class MockConfigService {
  config() {
    return {
      couchdbEndpoint: 'http://couchdb',
      protocol: 'https',
      hostName: 'localhost'
    }
  }
}

class MockPouchDB {
  constructor(userProfileId:string) {
    
  }
  get(_id:string) {
    return {
      _id,
      location: {
        "county": "a",
        "facility": "1"
      }
    }
  }
}
class MockDbService {
  instantiate(userProfileId:string) {
    return new MockPouchDB(userProfileId)
  }
}

describe('SyncSessionService', () => {
  let service: SyncSessionService;

  beforeEach(async () => {
    try {
      const module: TestingModule = await Test.createTestingModule({
        imports: [SharedModule],
        providers: [
          SyncSessionService,
          { 
            provide: TangerineConfigService,
            useClass: MockConfigService
          },
          {
            provide: HttpService,
            useClass: MockHttpService
          },
          {
            provide: GroupService,
            useClass: MockGroupService
          },
          {
            provide: ClientUserService,
            useClass: MockClientUserService
          },
          {
            provide: DbService,
            useClass: MockDbService
          }
        ]
      }).compile();

      service = module.get<SyncSessionService>(SyncSessionService);
    } catch (e) {
      debugger
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should start a sync session', async () => {
    const response = await service.start('group1', 'profile1')
    debugger
    const shouldRespondWith = {
      "pouchDbSyncUrl": "https://syncUser-ac15bf36-f9ea-4cbc-8761-48c3ebe968e0:6e99e4a5-15ac-488f-8c15-dd3633a77d72@localhost/db/group1",
      "pouchDbSyncOptions": {
        "selector": {
          "$or": [
            {
              "form.id": "example",
              "location.county": "a",
              "location.facility": "1"
            },
            {
              "_id": "profile1"
            }
          ]
        }
      },
      "formIdsToNotPush": [
        "example"
      ]
    }
    // Can't expect this to be the same, random UUID used in formation of url.
    // expect(response.pouchDbSyncUrl).toBe(shouldRespondWith.pouchDbSyncUrl)
    expect(response.pouchDbSyncOptions.selector['$or'][0]['form.id']).toBe(shouldRespondWith.pouchDbSyncOptions.selector['$or'][0]['form.id'])
    expect(response.pouchDbSyncOptions.selector['$or'][0]['location.county']).toBe(shouldRespondWith.pouchDbSyncOptions.selector['$or'][0]['location.county'])
    expect(response.pouchDbSyncOptions.selector['$or'][0]['location.facility']).toBe(shouldRespondWith.pouchDbSyncOptions.selector['$or'][0]['location.facility'])
    expect(response.pouchDbSyncOptions.selector['$or'][1]['_id']).toBe(shouldRespondWith.pouchDbSyncOptions.selector['$or'][1]['_id'])
    expect(response.formIdsToNotPush[0]).toBe(shouldRespondWith.formIdsToNotPush[0])
  })

});
