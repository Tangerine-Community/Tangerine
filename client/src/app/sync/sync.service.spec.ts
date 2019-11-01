import { FormInfo } from './../tangy-forms/classes/form-info.class';
import { TestBed, inject } from '@angular/core/testing';

import { SyncService } from './sync.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { UserService } from 'src/app/shared/_services/user.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { UserSignup } from 'src/app/shared/_classes/user-signup.class';

const TEST_USERNAME = 'test-user'
const TEST_FORM_ID_1 = 'TEST_FORM_ID_1'
const TEST_FORM_ID_2 = 'TEST_FORM_ID_2'

const TEST_FORM_INFOS_SYNC_CUSTOM = [
  <FormInfo>{
    id: TEST_FORM_ID_1,
    customSyncSettings: {
      enabled: true,
      push: true,
      pull: false
    }
  },
  <FormInfo>{
    id: TEST_FORM_ID_2,
    customSyncSettings: {
      enabled: true,
      push: true,
      pull: false
    },
  },
  <FormInfo>{
    id: 'user-profile',
    customSyncSettings: {
      enabled: true,
      push: true,
      pull: true 
    },
  }
]

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

class MockTangyFormService {
  async getFormsInfo() {
    return [
      {id: 'example1', src: './example1/form.json', title: 'Example 1'},
      {id: 'example2', src: './example2/form.json', title: 'Example 2'},
    ]
  }
}

class MockTangyFormInfoService {
  async getFormsInfo() {
    return [
      <FormInfo>{
        id: TEST_FORM_ID_1
      },
      <FormInfo>{
        id: TEST_FORM_ID_2
      }
    ]
  }
}

describe('syncService', () => {

  let httpClient: HttpClient
  let httpTestingController: HttpTestingController
  let userService: UserService
  let syncService: SyncService 

  beforeEach(async() => { 
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        UserService,
        syncService
      ]
    })
    // Get fresh injected instances.
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    userService = TestBed.get(UserService);
    syncService = TestBed.get(syncService)
  })

  it('should be created', inject([syncService], (service: SyncService) => {
    expect(service).toBeTruthy();
  }));

  it('should ...', async (done) => {
    // Initialize to install docs.
    await userService.initialize()
    await userService.install()
    // Create the user.
    await userService.create(<UserSignup>{
      username: TEST_USERNAME,
      password: 'password',
      securityQuestionResponse: '...'
    })
    // Get the user db.
    const userDb = await userService.getUserDatabase(TEST_USERNAME)
    // Create docs.
    await userDb.post({
      collection: 'TangyFormResponse',
      form: {
        id: TEST_FORM_ID_1
      },
      complete: true
    })
    await userDb.post({
      collection: 'TangyFormResponse',
      form: {
        id: TEST_FORM_ID_2
      },
      complete: true
    })
    const docs = await userDb.allDocs({include_docs:true})
    debugger
    // Test push.
    let uploadQueue1 = await syncService.getUploadQueue(userDb, TEST_FORM_INFOS_SYNC_CUSTOM)
    debugger
    /*
    expect(uploadQueue1.length).toEqual(2)
    expect((await syncService.getDocsUploaded(TEST_USERNAME)).length).toEqual(0)
    await syncService.push(TEST_USERNAME, [ TEST_FORM_ID_2 ])
    expect((await syncService.getUploadQueue(TEST_USERNAME, [ TEST_FORM_ID_2 ])).length).toEqual(0)
    expect((await syncService.getDocsUploaded(TEST_USERNAME)).length).toEqual(2)
    // Test pull.
    await syncService.pull(TEST_USERNAME)
    expect((await userService.getUserProfile(TEST_USERNAME)).items.length).toEqual(1)
    // Update a doc...

    // Should calculate we have one doc to upload, others are good.

    // Uninstall...
    await userService.uninstall()
    */

  } )

});
