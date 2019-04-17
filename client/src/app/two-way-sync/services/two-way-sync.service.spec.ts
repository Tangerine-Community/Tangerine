import { TestBed } from '@angular/core/testing';

import PouchDB from 'pouchdb';

import { TwoWaySyncService } from './two-way-sync.service';
import { AppConfig } from 'src/app/shared/_classes/app-config.class';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { UserService } from 'src/app/shared/_services/user.service';
import { TwoWaySyncModule } from '../two-way-sync.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { TangyFormsModule } from 'src/app/tangy-forms/tangy-forms.module';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';

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

describe('TwoWaySyncService', () => {

  let httpClient: HttpClient
  let httpTestingController: HttpTestingController
  let userService: UserService
  let twoWaySyncService: TwoWaySyncService

  beforeEach(async() => { 
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        SharedModule,
        TwoWaySyncModule
      ],
      providers: [
        {provide: AppConfigService, useClass: MockAppConfigService},
      ]
    })
    // Get fresh injected instances.
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    userService = TestBed.get(UserService);
    twoWaySyncService = TestBed.get(TwoWaySyncService)
    // Browser cleanup while developing and tests are failing.
    /*
    const r = new PouchDB(MOCK_REMOTE_DB_INFO)
    await r.destroy()
    const l = new PouchDB(MOCK_LOCAL_DB_INFO)
    await l.destroy()
    const u = new PouchDB('users')
    await u.destroy()
    */
  })

  it('should be created', () => {
    const service: TwoWaySyncService = TestBed.get(TwoWaySyncService);
    expect(service).toBeTruthy();
  });

  it('should sync', async function(done) {
    await userService.create({
      username: MOCK_LOCAL_DB_INFO,
      securityQuestionResponse: '123',
      password: '123'
    })
    // Prepopulate the mock remote db.
    const mockRemoteDb = new PouchDB(MOCK_REMOTE_DB_INFO)
    await mockRemoteDb.put({_id:"doc1", collection: 'FormResponse', form: {id: "example"}})
    await mockRemoteDb.put({_id:"doc2", collection: 'FormResponse', form: {id: "example"}})
    await mockRemoteDb.put({_id:"doc3", collection: 'FormResponse', form: {id: "example"}})
    await mockRemoteDb.put({_id:"doc4", collection: 'FormResponse', form: {id: "example"}})
    await mockRemoteDb.put({
      _id: '_design/sync_filter-by-form-ids',
      filters: {
        "sync_filter-by-form-ids": function (doc, req) {
          var formIds = req.query.formIds.split(',')
          return doc.collection === 'FormResponse' &&
            doc.form &&
            doc.form.id &&
            formIds.includes(doc.form.id)
        }.toString()
      }
    })
    const mockLocalDb = new PouchDB(MOCK_LOCAL_DB_INFO)
    await mockLocalDb.put({_id:"doc5", collection: 'FormResponse', form: {id: "example"}})
    await mockLocalDb.put({_id:"doc6", collection: 'FormResponse', form: {id: "example"}})
    twoWaySyncService.sync(MOCK_LOCAL_DB_INFO).then(async status => {
      expect(status.pulled).toBe(4)
      expect(status.pushed).toBe(2)
      expect(status.conflicts.length).toBe(0)
      /*
      const remoteAllDocs = await mockRemoteDb.allDocs()
      const localAllDocs = await mockLocalDb.allDocs()
      // Note how total docs in databases differ because of priorities. Plus 4 for design docs, an info doc, and a profile doc.
      expect(remoteAllDocs.total_rows).toBe(6+4)
      expect(localAllDocs.total_rows).toBe(4+4)
      */
      await userService.remove(MOCK_LOCAL_DB_INFO)
      await mockRemoteDb.destroy()
      done()
    })
    setTimeout(() => {
      const req = httpTestingController.expectOne(`${MOCK_SERVER_URL}/api/start-sync-session`);
      //expect(req.request.method).toEqual('GET');
      req.flush({
        url: MOCK_REMOTE_DB_INFO,
        filter: 'sync_filter-by-form-ids',
        query_params: { formIds:'example' }
      });
    }, 1000)
  }, 3000)
/*
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
    twoWaySyncService.sync(MOCK_LOCAL_DB_INFO).then(async status => {
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
*/
});
