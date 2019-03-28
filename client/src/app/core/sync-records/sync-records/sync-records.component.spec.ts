import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SyncRecordsComponent } from './sync-records.component';
import { SyncRecordsModule } from '../sync-records.module';
import { HttpClient } from '@angular/common/http';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { UserService } from 'src/app/shared/_services/user.service';
import { HttpClientTestingBackend } from '@angular/common/http/testing/src/backend';
import { SharedModule } from 'src/app/shared/shared.module';
import { TangyFormsModule } from 'src/app/tangy-forms/tangy-forms.module';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import PouchDB from 'pouchdb'
import { AppConfig } from 'src/app/shared/_models/app-config.model';

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
        syncProtocol: 'SYNC_TWO_WAY',
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

describe('SyncRecordsComponent', () => {

  let component: SyncRecordsComponent;
  let fixture: ComponentFixture<SyncRecordsComponent>;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let userService: UserService;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [SyncRecordsModule, HttpClientTestingModule, SharedModule, TangyFormsModule],
      providers: [
        UserService,
        {provide: AppConfigService, useClass: MockAppConfigService},
      ]
    })
    .compileComponents();
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
    fixture = TestBed.createComponent(SyncRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

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
    component.syncEvent.subscribe(async syncStatus => {
      expect(syncStatus.complete).toBe(true)
      await userService.remove(MOCK_LOCAL_DB_INFO)
      await mockRemoteDb.destroy()
      done()
    })
    component.sync()
    fixture.detectChanges();
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
