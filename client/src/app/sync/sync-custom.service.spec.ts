import { TestBed } from '@angular/core/testing';
import { SyncCustomService } from './sync-custom.service';
import { UserDatabase } from './../shared/_classes/user-database.class';
import { AppConfig } from './../shared/_classes/app-config.class';
import { SYNC_DOCS } from './sync.docs';
import { DEFAULT_USER_DOCS } from './../shared/_tokens/default-user-docs.token';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { FormInfo, CouchdbSyncSettings } from './../tangy-forms/classes/form-info.class';

import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { UserService } from 'src/app/shared/_services/user.service';
import { HttpClient } from '@angular/common/http';
import { UserSignup } from 'src/app/shared/_classes/user-signup.class';

/* @TODO

const TEST_USERNAME = 'test-user'
const TEST_FORM_ID_1 = 'TEST_FORM_ID_1'
const TEST_FORM_ID_2 = 'TEST_FORM_ID_2'
const TEST_FORM_ID_3 = 'TEST_FORM_ID_3'
const MOCK_USER_ID = 'MOCK_USER_ID'

const TEST_FORM_INFOS_SYNC_COUCHDB = [

]

const MOCK_REMOTE_DOC_IDS = [
  'doc1',
  'doc2'
]

const MOCK_REMOTE_DB_INFO_1 = 'MOCK_REMOTE_DB_INFO_1'
const MOCK_LOCAL_DB_INFO_1 = 'MOCK_LOCAL_DB_INFO_1'
const MOCK_REMOTE_DB_INFO_2 = 'MOCK_REMOTE_DB_INFO_2'
const MOCK_LOCAL_DB_INFO_2 = 'MOCK_LOCAL_DB_INFO_2'

const MOCK_SERVER_URL = 'http://localhost/'

const MOCK_APP_CONFIG = <AppConfig>{
  serverUrl: MOCK_SERVER_URL,
  groupName: 'foo',
  sharedUserDatabase: false
}

class MockAppConfigService {
  getAppConfig():Promise<AppConfig> {
    return new Promise((resolve, reject) => {
      resolve(MOCK_APP_CONFIG)
    })
  }
}

describe('SyncCustomService', () => {
 
  let httpClient: HttpClient
  let httpTestingController: HttpTestingController
  let userService: UserService
  let syncCustomService: SyncCustomService 
  let userDb: UserDatabase

  beforeEach(async() => { 
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
      {provide: AppConfigService, useClass: MockAppConfigService},
       {
          provide: DEFAULT_USER_DOCS,
          useValue: SYNC_DOCS,
          multi: true
        },
        UserService,
        SyncCustomService 
 
      ]
    })
    // Get fresh injected instances.
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    userService = TestBed.get(UserService);
    syncCustomService = TestBed.get(SyncCustomService)
    // Initialize to install docs.
    await userService.initialize()
    await userService.install()
    // Create the user.
    await userService.create(<UserSignup>{
      username: TEST_USERNAME,
      password: 'password',
      securityQuestionResponse: '...'
    })
    userDb = await userService.getUserDatabase(TEST_USERNAME)
  })

  afterEach(async () => {
    await userService.uninstall()
  })

  it('should custom push and then have a reduced queue', async(done) => {
    const FORM_INFO = [
      <FormInfo>{
        id: TEST_FORM_ID_1,
        customSyncSettings: {
          enabled: true,
          push: true,
          pull: false,
          excludeIncomplete: false 
        },
        couchdbSyncSettings: <CouchdbSyncSettings>{
          enabled: false,
          filterByLocation: false
        }
    
      }
    ]
    const TEST_DOC = {
      _id: '1',
      collection: 'TangyFormResponse',
      form: {
        id: TEST_FORM_ID_1
      },
      items: [],
      complete: false
    }
    await userDb.post(TEST_DOC)
    expect((await syncCustomService.uploadQueue(userDb, FORM_INFO)).includes(TEST_DOC._id)).toEqual(true)
    syncCustomService.push(userDb, MOCK_APP_CONFIG, [ TEST_DOC._id ]).then(async() => {
      expect((await syncCustomService.uploadQueue(userDb, FORM_INFO)).includes(TEST_DOC._id)).toEqual(false)
      done()
    })
    setTimeout(() => {
      const req = httpTestingController.expectOne(`${MOCK_APP_CONFIG.serverUrl}api/${MOCK_APP_CONFIG.groupName}/upload`);
      expect(req.request.method).toEqual('POST')
      req.flush({ status: 'ok' });
    }, 500)
  }, 2000)
  it('should custom pull')
});
*/
