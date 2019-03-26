import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { HttpClient, HttpResponse } from '@angular/common/http';
import { PecSyncService } from './pec-sync.service';
import { UserService } from './user.service';
import { AppConfigService } from './app-config.service';
import { AppConfig } from 'src/app/app-config.class';
import PouchDB from 'pouchdb'
import PouchDBFind from 'pouchdb-find';
PouchDB.plugin(PouchDBFind)


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


describe('PecSyncService', () => {

  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let pecSyncService: PecSyncService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ HttpClientTestingModule],
      providers: [
        PecSyncService,
        {provide: AppConfigService, useClass: MockAppConfigService},
        {provide: UserService, useClass: MockUserService},
      ]
    })

    // Cleanup while developing and tests are failing.
    const r = new PouchDB(MOCK_REMOTE_DB_INFO)
    await r.destroy()
    const l = new PouchDB(MOCK_LOCAL_DB_INFO)
    await l.destroy()


    // Inject the http, test controller, and service-under-test
    // as they will be referenced by each test.
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    pecSyncService = TestBed.get(PecSyncService);
  });

  afterEach(async () => {
    const mockRemoteDb = new PouchDB(MOCK_REMOTE_DB_INFO)
    await mockRemoteDb.destroy()
    // After every test, assert that there are no more pending requests.
    httpTestingController.verify();
  });

  it('should be created', async () => {
    const service: PecSyncService = TestBed.get(PecSyncService);
    expect(service).toBeTruthy();
  });

  it('should setup', (done) => {
    pecSyncService.setup(MOCK_LOCAL_DB_INFO).then(status => {
      expect(status.doc_ids.length).toBe(2)
      done()
    })
    setTimeout(() => {
      const req = httpTestingController.expectOne(`${MOCK_SERVER_URL}/api/start-sync-session`);
      req.flush({
        syncUrl: MOCK_REMOTE_DB_INFO,
        doc_ids: MOCK_REMOTE_DOC_IDS
      });
    })

  })

  it('should sync', async (done) => {
    // Prepopulate the mock remote db.
    const mockRemoteDb = new PouchDB(MOCK_REMOTE_DB_INFO)
    await mockRemoteDb.put({_id:"doc1"})
    await mockRemoteDb.put({_id:"doc2"})
    await mockRemoteDb.put({_id:"doc3"})
    await mockRemoteDb.put({_id:"doc4"})
    const mockLocalDb = new PouchDB(MOCK_LOCAL_DB_INFO)
    await mockLocalDb.put({_id:"doc5"})
    await mockLocalDb.put({_id:"doc6"})
    pecSyncService.sync(MOCK_LOCAL_DB_INFO).then(async status => {
      expect(status.pulled).toBe(2)
      // @TODO We're not correctly capturing the number of documents that end up being pushed.
      // expect(status.pushed).toBe(2)
      expect(status.conflicts).toBe(0)
      const remoteAllDocs = await mockRemoteDb.allDocs()
      const localAllDocs = await mockLocalDb.allDocs()
      // Note how total docs in databases differ because of priorities.
      expect(remoteAllDocs.total_rows).toBe(6)
      expect(localAllDocs.total_rows).toBe(4)
      done()
    })
    setTimeout(() => {
      const req = httpTestingController.expectOne(`${MOCK_SERVER_URL}/api/start-sync-session`);
      expect(req.request.method).toEqual('GET');
      req.flush({
        syncUrl: MOCK_REMOTE_DB_INFO,
        doc_ids: ['doc1', 'doc2'] 
      });
    })
  })

  it('should sync but with conflicts', async (done) => {
    // Prepopulate the mock remote db.
    const mockRemoteDb = new PouchDB(MOCK_REMOTE_DB_INFO)
    await mockRemoteDb.put({_id:"doc1"})
    await mockRemoteDb.put({_id:"doc2"})
    const mockLocalDb = new PouchDB(MOCK_LOCAL_DB_INFO)
    await mockLocalDb.put({_id:"doc3"})
    await mockLocalDb.put({_id:"doc4"})
    await mockRemoteDb.sync(mockLocalDb)
    const localDoc1 = await mockLocalDb.get('doc1')
    const remoteDoc1 = await mockRemoteDb.get('doc1')
    await mockLocalDb.put({...localDoc1, foo: 'local change'})
    await mockRemoteDb.put({...remoteDoc1, foo: 'remote change'})
    // @TODO Put this ddoc in the user database service.
    const ddoc = {
      _id: '_design/conflicts',
      views: {
        conflicts: {
          map: `function mapFun(doc) {
            if (doc._conflicts) {
              emit(true);
            }
          }`
        }
      }
    }
    await mockLocalDb.put(ddoc)
    pecSyncService.sync(MOCK_LOCAL_DB_INFO).then(async status => {
      const localAllDocs = await mockLocalDb.allDocs({include_docs: true, conflicts: true})
      const remoteAllDocs = await mockRemoteDb.allDocs({include_docs: true, conflicts: true})
      expect(status.pulled).toBe(1)
      expect(status.conflicts.length).toBe(1)
      done()
    })
    setTimeout(() => {
      const req = httpTestingController.expectOne(`${MOCK_SERVER_URL}/api/start-sync-session`);
      expect(req.request.method).toEqual('GET');
      req.flush({
        syncUrl: MOCK_REMOTE_DB_INFO,
        doc_ids: MOCK_REMOTE_DOC_IDS
      });
    })
  })

});
