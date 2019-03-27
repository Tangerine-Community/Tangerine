import { TestBed, inject } from '@angular/core/testing';

import { UserService } from './user.service';
import PouchDB from 'pouchdb'
import { AppConfig } from '../_models/app-config.model';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { AppConfigService } from './app-config.service';
import { SharedModule } from '../shared.module';
import { TangyFormsModule } from 'src/app/tangy-forms/tangy-forms.module';

const MOCK_REMOTE_DOC_IDS = [
  'doc1',
  'doc2'
] 

const MOCK_REMOTE_DB_INFO = 'mock-remote-db'
const MOCK_LOCAL_DB_INFO = 'mock-local-db'
const MOCK_SERVER_URL = 'http://localhost'

class MockAppConfigService {
  getAppConfig():Promise<AppConfig> {
    return new Promise((resolve, reject) => {
      resolve(<AppConfig>{ 
        serverUrl: MOCK_SERVER_URL,
        groupName: 'foo'
      })
    })
  }
}

class MockUserService {
  async getUserProfile(username:string) {
    return { _id: 'ABC123' }
  }
}


describe('UserService', () => {

  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let userService: UserService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule, SharedModule, TangyFormsModule ],
      providers: [
        UserService,
        {provide: AppConfigService, useClass: MockAppConfigService},
      ]
    });
    // Browser cleanup while developing and tests are failing.
    const r = new PouchDB(MOCK_REMOTE_DB_INFO)
    await r.destroy()
    const l = new PouchDB(MOCK_LOCAL_DB_INFO)
    await l.destroy()
    const u = new PouchDB('users')
    await u.destroy()
    // Get fresh injected instances.
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    userService = TestBed.get(UserService);
  });

  it('should create user', async function() {
    await userService.create({
      username: MOCK_LOCAL_DB_INFO,
      securityQuestionResponse: '123',
      password: '123'
    })
    const userAccountDoc = await userService.getUserAccount(MOCK_LOCAL_DB_INFO)
    const userProfileDoc = await userService.getUserProfile(MOCK_LOCAL_DB_INFO)
    expect(userAccountDoc._id).toEqual(MOCK_LOCAL_DB_INFO)
    expect(userProfileDoc._id).toEqual(userAccountDoc.userUUID)
    await userService.remove(MOCK_LOCAL_DB_INFO)
  })

  it('should sync setup', async function(done) {
    await userService.create({
      username: MOCK_LOCAL_DB_INFO,
      securityQuestionResponse: '123',
      password: '123'
    })
    userService.syncSetup(MOCK_LOCAL_DB_INFO).then(async status => {
      expect(status.doc_ids.length).toBe(2)
      await userService.remove(MOCK_LOCAL_DB_INFO)
      done()
    })
    setTimeout(() => {
      const req = httpTestingController.expectOne(`${MOCK_SERVER_URL}/api/start-sync-session`);
      req.flush({
        syncUrl: MOCK_REMOTE_DB_INFO,
        doc_ids: MOCK_REMOTE_DOC_IDS
      });
    }, 1000)
  })

  it('should sync', async function(done) {
    await userService.create({
      username: MOCK_LOCAL_DB_INFO,
      securityQuestionResponse: '123',
      password: '123'
    })
    // Prepopulate the mock remote db.
    const mockRemoteDb = new PouchDB(MOCK_REMOTE_DB_INFO)
    await mockRemoteDb.put({_id:"doc1"})
    await mockRemoteDb.put({_id:"doc2"})
    await mockRemoteDb.put({_id:"doc3"})
    await mockRemoteDb.put({_id:"doc4"})
    const mockLocalDb = new PouchDB(MOCK_LOCAL_DB_INFO)
    await mockLocalDb.put({_id:"doc5"})
    await mockLocalDb.put({_id:"doc6"})
    userService.sync(MOCK_LOCAL_DB_INFO).then(async status => {
      expect(status.pulled).toBe(2)
      // @TODO We're not correctly capturing the number of documents that end up being pushed.
      // expect(status.pushed).toBe(2)
      expect(status.conflicts.length).toBe(0)
      const remoteAllDocs = await mockRemoteDb.allDocs()
      const localAllDocs = await mockLocalDb.allDocs()
      // Note how total docs in databases differ because of priorities. Plus 4 for design docs, an info doc, and a profile doc.
      expect(remoteAllDocs.total_rows).toBe(6+4)
      expect(localAllDocs.total_rows).toBe(4+4)
      await userService.remove(MOCK_LOCAL_DB_INFO)
      await mockRemoteDb.destroy()
      done()
    })
    setTimeout(() => {
      const req = httpTestingController.expectOne(`${MOCK_SERVER_URL}/api/start-sync-session`);
      expect(req.request.method).toEqual('GET');
      req.flush({
        syncUrl: MOCK_REMOTE_DB_INFO,
        doc_ids: ['doc1', 'doc2'] 
      });
    }, 1000)
  })

  it('should sync but with conflicts', async (done) => {
    await userService.create({
      username: MOCK_LOCAL_DB_INFO,
      securityQuestionResponse: '123',
      password: '123'
    })
    // Prepopulate the mock remote db.
    const mockRemoteDb = new PouchDB(MOCK_REMOTE_DB_INFO)
    await mockRemoteDb.put({_id:"doc1"})
    await mockRemoteDb.put({_id:"doc2"})
    const mockLocalDb = userService.getUserDatabase(MOCK_LOCAL_DB_INFO)
    await mockLocalDb.put({_id:"doc3"})
    await mockLocalDb.put({_id:"doc4"})
    await mockRemoteDb.sync(mockLocalDb)
    const localDoc1 = await mockLocalDb.get('doc1')
    const remoteDoc1 = await mockRemoteDb.get('doc1')
    await mockLocalDb.put({...localDoc1, foo: 'local change'})
    await mockRemoteDb.put({...remoteDoc1, foo: 'remote change'})
    userService.sync(MOCK_LOCAL_DB_INFO).then(async status => {
      const localAllDocs = await mockLocalDb.allDocs({include_docs: true, conflicts: true})
      const remoteAllDocs = await mockRemoteDb.allDocs({include_docs: true, conflicts: true})
      expect(status.pulled).toBe(1)
      expect(status.conflicts.length).toBe(1)
      await userService.remove(MOCK_LOCAL_DB_INFO)
      await mockRemoteDb.destroy()
      done()
    })
    setTimeout(() => {
      const req = httpTestingController.expectOne(`${MOCK_SERVER_URL}/api/start-sync-session`);
      expect(req.request.method).toEqual('GET');
      req.flush({
        syncUrl: MOCK_REMOTE_DB_INFO,
        doc_ids: MOCK_REMOTE_DOC_IDS
      });
    }, 1000)
  })

})
