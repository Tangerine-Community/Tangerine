import PouchDB from 'pouchdb';
import { UserDatabase } from './../shared/_classes/user-database.class';
import { AppConfig } from './../shared/_classes/app-config.class';
import { SYNC_DOCS } from './sync.docs';
import { DEFAULT_USER_DOCS } from './../shared/_tokens/default-user-docs.token';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { FormInfo, CouchdbSyncSettings, CustomSyncSettings } from './../tangy-forms/classes/form-info.class';
import { TestBed, inject } from '@angular/core/testing';

import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { UserService } from 'src/app/shared/_services/user.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { SyncCouchdbService, LocationQuery, SyncCouchdbDetails } from './sync-couchdb.service';
import {Device} from "../device/classes/device.class";
import {CaseDefinition} from "../case/classes/case-definition.class";
import {TangyFormService} from "../tangy-forms/tangy-form.service";


const TEST_USERNAME = 'test-user'

const TEST_FORM_ID_1 = 'TEST_FORM_ID_1'
const TEST_FORM_ID_2 = 'TEST_FORM_ID_2'
const TEST_FORM_ID_3 = 'TEST_FORM_ID_3'

const MOCK_GROUP_ID = 'MOCK_GROUP_ID'
const MOCK_DEVICE_ID = 'MOCK_DEVICE_ID'
const MOCK_DEVICE_TOKEN = 'MOCK_DEVICE_TOKEN'
const MOCK_SERVER_URL = 'MOCK_SERVER_URL'
const MOCK_PASSWORD = 'a'

const MOCK_REMOTE_DB_CONNECT_STRING = 'MOCK_REMOTE_DB_CONNECT_STRING'
const MOCK_LOCAL_DB_CONNECT_STRING = 'MOCK_LOCAL_DB_CONNECT_STRING'

const MOCK_APP_CONFIG = <AppConfig><unknown>{
  "sharedUserDatabase": true,
  "couchdbPushUsingDocIds": true,
}

const MOCK_LOCATION_LIST = {
  "locationsLevels": [
    "region",
    "district",
    "facility"
  ],
  "locations": {
    "B7BzlR6h": {
      "label": "Region 1",
      "id": "B7BzlR6h",
      "children": {
        "rrCuQT12": {
          "label": "District A",
          "id": "rrCuQT12",
          "children": {
            "K0xhy1Su": {
              "label": "Facility 2",
              "id": "K0xhy1Su",
              "level": "facility",
              "parent": "rrCuQT12",
              "children": {},
              "descendantsCount": 0
            },
            "RJghrv5d": {
              "label": "Facility 1",
              "id": "RJghrv5d",
              "level": "facility",
              "parent": "rrCuQT12",
              "children": {},
              "descendantsCount": 0
            }
          },
          "level": "district",
          "parent": "B7BzlR6h",
          "descendantsCount": 2
        }
      },
      "level": "region",
      "parent": "root",
      "descendantsCount": 4
    }
  },
  "metadata": {}
}

window['userProfile'] = {
  _id: 'testuser'
}
window['username'] = 'testuser'
let userDb: UserDatabase;

class MockAppConfigService {
  getAppConfig():Promise<AppConfig> {
    return new Promise((resolve, reject) => {
      resolve(MOCK_APP_CONFIG)
    })
  }
  getLocationList():Promise<any> {
    return new Promise((resolve, reject) => {
      resolve(MOCK_LOCATION_LIST)
    })
  }

}
let a =
{
  "_id": "doc1",
  "collection": "TangyFormResponse",
  "form": {
    id:"TEST_FORM_ID_1"
  },
  "items": [],
  "complete": false,
  "focusIndex": 0,
  "nextFocusIndex": 1,
  "previousFocusIndex": -1,
  "startDatetime": "8/19/2020, 7:02:25 PM",
  "startUnixtime": 1597881745106,
  "uploadDatetime": "",
  "location": {},
  "type": "case",
  "events": [
  {
    "id": "event1",
    "caseEventDefinitionId": "event-definition-1",
    "eventForms": [
      {
        "id": "event-form-1",
        "eventFormDefinitionId": "event-form-definition-1",
        "formResponseId": "form-response-1",
        "conflicts": []
      },
      {
        "id": "event-form-2",
        "eventFormDefinitionId": "event-form-definition-2",
        "formResponseId": "form-response-2",
        "required": true,
        "conflicts": []
      }
    ]
  }
],
  "participants": [],
  "disabledEventDefinitionIds": [],
  "notifications": [],
  "caseDefinitionId": "test"
}

// Set up form infos and a mock remote database to sync with.
const FORM_INFOS = [
  <FormInfo><unknown>{
    id: TEST_FORM_ID_1,
    formId: "test",
    name: "Test",
    eventDefinitions: [
      {
        id: 'event-definition-1',
        name: 'Event 1',
        eventFormDefinitions: [
          {
            id: 'event-form-definition-1',
            name: 'Event Form 1',
            formId: 'form-1'
          },
          {
            id: 'event-form-definition-2',
            name: 'Event Form 2',
            formId: 'form-2'
          }
        ]
      }
    ],
    customSyncSettings: {
      enabled: false,
      push: false,
      pull: false,
      excludeIncomplete: false
    },
    couchdbSyncSettings: <CouchdbSyncSettings>{
      enabled: true,
      filterByLocation: true,
      push: true,
      pull: true
    }
  }
]

let device: Device
device = new Device()
device._id = MOCK_DEVICE_ID
device.token = MOCK_DEVICE_TOKEN
device.key = 'test'
device.claimed = true
device.syncLocations = [
  {
    "value": [
      {
        "level": "region",
        "value": "B7BzlR6h"
      }
    ],
    "showLevels": [
      "region"
    ]
  }
]
device.assignedLocation = {
  "value": [
    {
      "level": "region",
      "value": "B7BzlR6h"
    },
    {
      "level": "district",
      "value": "rrCuQT12"
    },
    {
      "level": "facility",
      "value": "RJghrv5d"
    }
  ],
  "showLevels": [
    "region",
    "district",
    "facility"
  ]
}

const caseDefinitions:CaseDefinition[] =
  [
    {
      "id": "test",
      "formId": "test",
      "name": "Case Type 1",
      "description": "This is Case Type 1.",
      eventDefinitions: [
        {
          id: 'event-definition-1',
          name: 'Event 1',
          eventFormDefinitions: [
            {
              id: 'event-form-definition-1',
              name: 'Event Form 1',
              formId: 'form-1'
            },
            {
              id: 'event-form-definition-2',
              name: 'Event Form 2',
              formId: 'form-2'
            }
          ]
        }
      ]
    }
  ]

async function destroyDatabases() {
  const sharedDb = new PouchDB('shared-user-database')
  await sharedDb.destroy()
  const boxesDb = new PouchDB('tangerine-lock-boxes')
  await boxesDb.destroy()
  const varsDb = new PouchDB('tangerine-variables')
  await varsDb.destroy()
  const mockRemoteDb = new PouchDB(MOCK_REMOTE_DB_CONNECT_STRING)
  await mockRemoteDb.destroy()
  const mockLocalDb = new PouchDB(MOCK_LOCAL_DB_CONNECT_STRING)
  await mockLocalDb.destroy()
}

class MockTangyFormService {

  response:any

  async getFormMarkup(formId) {
    return `
      <tangy-form id='caseDefinition1Form'>
        <tangy-form-item id='item1'>
          <tangy-input name='input1'></tangy-input>
        </tangy-form>
      </tangy-form>
    `
  }
  async saveResponse(responseDoc) {
    let db = userDb
    let r
    if (!responseDoc._id) {
      r = await db.post(responseDoc)
    }
    else {
      r = await db.put(responseDoc)
    }
    return await db.get(r.id)
  }

  async getResponse(id) {
    const response = await userDb.get(id)
    return response
    ///
  }
}

describe('SyncCouchdbService', () => {

  let httpClient: HttpClient
  let httpTestingController: HttpTestingController
  let userService: UserService
  let syncCouchdbService: SyncCouchdbService

  beforeEach(async() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;
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
        SyncCouchdbService,
        {
          provide: TangyFormService,
          useClass: MockTangyFormService
        }
      ]
    })
    const sharedDb = new PouchDB('shared-user-database')
    await sharedDb.destroy()
    const boxesDb = new PouchDB('tangerine-lock-boxes')
    await boxesDb.destroy()
    const varsDb = new PouchDB('tangerine-variables')
    await varsDb.destroy()
    const mockRemoteDb = new PouchDB(MOCK_REMOTE_DB_CONNECT_STRING)
    await mockRemoteDb.destroy()
    const mockLocalDb = new PouchDB(MOCK_LOCAL_DB_CONNECT_STRING)
    await mockLocalDb.destroy()
    // Get fresh injected instances.
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    userService = TestBed.get(UserService);
    syncCouchdbService = TestBed.get(SyncCouchdbService)
    // In case there was an error, make sure all db's are destroyed.
    // await destroyDatabases();

  })

  afterEach(async () => {
    // await destroyDatabases();
    const sharedDb = new PouchDB('shared-user-database')
    await sharedDb.destroy()
    const boxesDb = new PouchDB('tangerine-lock-boxes')
    await boxesDb.destroy()
    const varsDb = new PouchDB('tangerine-variables')
    await varsDb.destroy()
    const mockRemoteDb = new PouchDB(MOCK_REMOTE_DB_CONNECT_STRING)
    await mockRemoteDb.destroy()
    const mockLocalDb = new PouchDB(MOCK_LOCAL_DB_CONNECT_STRING)
    await mockLocalDb.destroy()
  })

  it('should be created', () => {
    expect(!!syncCouchdbService).toEqual(true);
  })

  fit('should sync but with conflicts', async (done) => {

    userService.setCurrentUser('testuser')
    localStorage.setItem('buildId', '12345')
    localStorage.setItem('rawBuildChannel', 'test')
    // Initialize to install docs.
    await userService.initialize()
    await userService.installSharedUserDatabaseOnly(device)
    userDb =  new UserDatabase(TEST_USERNAME, '1', device.key, device._id, true, '12345', 'test', 'test-group')
    const mockRemoteDb:PouchDB = new PouchDB(MOCK_REMOTE_DB_CONNECT_STRING)
    // Pre-populate the a doc then send to remote.
    await userDb.put(a)
    await userDb.put({
      _id:"form-response-1",
      location: {
        "region": "B7BzlR6h"
      },
      collection: 'TangyFormResponse',
      form: {id: TEST_FORM_ID_1},
      items: [],
      complete: true
    })
    await mockRemoteDb.sync(userDb.db)
    // Get and edit the doc in both places to make a conflict.
    const localDoc1 = await userDb.get('doc1')
    await userDb.put({...localDoc1})
    const remoteDoc1 = await mockRemoteDb.get('doc1')
    await mockRemoteDb.put({
      ...remoteDoc1,
      events: [
        {
          id: 'event1',
          caseEventDefinitionId: 'event-definition-1',
          eventForms: [
            {
              id: 'event-form-1',
              eventFormDefinitionId: 'event-form-definition-1',
              formResponseId: 'form-response-1'
            },
            {
              id: 'event-form-2',
              eventFormDefinitionId: 'event-form-definition-2',
              formResponseId: 'form-response-2',
              required: true
            }
          ]
        }
      ]})
      await mockRemoteDb.put({
        _id:"form-response-2",
        location: {
          "region": "B7BzlR6h"
        },
        collection: 'TangyFormResponse',
        form: {id: TEST_FORM_ID_1},
        items: [],
        complete: true
      })
    // sync the change to the doc
    await mockRemoteDb.sync(userDb.db)
    // Now use syncCouchdbService to sync userDb and pull down the changes
    syncCouchdbService.sync(userDb, <SyncCouchdbDetails>{
      serverUrl: MOCK_SERVER_URL,
      groupId: MOCK_GROUP_ID,
      deviceId: MOCK_DEVICE_ID,
      deviceToken: MOCK_DEVICE_TOKEN,
      formInfos: FORM_INFOS,
      locationQueries: [],
      deviceSyncLocations: device.syncLocations
    }, caseDefinitions).then(async status => {
      expect(status.pushed).toBe(1)
      expect(status.pushConflicts.length).toBe(1)
      done()
    })
    setTimeout(() => {
      const req = httpTestingController.expectOne(`${MOCK_SERVER_URL}sync-session/start/${MOCK_GROUP_ID}/${MOCK_DEVICE_ID}/${MOCK_DEVICE_TOKEN}`);
      expect(req.request.method).toEqual('GET')
      req.flush(MOCK_REMOTE_DB_CONNECT_STRING);
    }, 500)
  })

  // it('should automatically resolve merge conflict')

  // it('should sync by location', async (done) => {
  //   // Set up form infos and a mock remote database to sync with.
  //   const FORM_INFOS = [
  //     // A FormInfo where we use couchdb sync and filter by location.
  //     <FormInfo>{
  //       id: TEST_FORM_ID_1,
  //       customSyncSettings: <CustomSyncSettings>{
  //         enabled: false,
  //         push: false,
  //         pull: false,
  //         excludeIncomplete: false
  //       },
  //       couchdbSyncSettings: <CouchdbSyncSettings>{
  //         enabled: true,
  //         filterByLocation: true
  //       }
  //     },
  //     // A FormInfo where we use couchdb sync and do not filter by location.
  //     <FormInfo>{
  //       id: TEST_FORM_ID_2,
  //       customSyncSettings: <CustomSyncSettings>{
  //         enabled: false,
  //         push: false,
  //         pull: false,
  //         excludeIncomplete: false
  //       },
  //       couchdbSyncSettings: <CouchdbSyncSettings>{
  //         enabled: true,
  //         filterByLocation: false
  //       }
  //     },
  //     // A FormInfo where we use don't use couchdb replication.
  //     <FormInfo>{
  //       id: TEST_FORM_ID_3,
  //       customSyncSettings: <CustomSyncSettings>{
  //         enabled: true,
  //         push: true,
  //         pull: false,
  //         excludeIncomplete: false
  //       },
  //       couchdbSyncSettings: <CouchdbSyncSettings>{
  //         enabled: false,
  //         filterByLocation: false
  //       }
  //     }
  //   ]
  //   const LOCATION_LEVEL_1 = 'county'
  //   const LOCATION_LEVEL_2 = 'city'
  //   const LOCATION_1 = {
  //     [LOCATION_LEVEL_1]: 'county1',
  //     [LOCATION_LEVEL_2]: 'city1'
  //   }
  //   const LOCATION_2 = {
  //     [LOCATION_LEVEL_1]: 'county2',
  //     [LOCATION_LEVEL_2]: 'city2'
  //   }
  //   // Tie location query to LOCATION_1's second level.
  //   const MOCK_LOCATION_QUERY = <LocationQuery>{
  //     level: LOCATION_LEVEL_1,
  //     id: LOCATION_1[LOCATION_LEVEL_1]
  //   }
  //   const mockRemoteDb = new PouchDB(MOCK_REMOTE_DB_CONNECT_STRING)
  //   //window['userDb'] = userDb
  //   //window['mockRemoteDb'] = mockRemoteDb
  //   // This syncs because it belongs to a FormInfo configured to filterByLocation and the location will match the location query.
  //   await mockRemoteDb.put({
  //     _id:"doc1",
  //     location: LOCATION_1,
  //     collection: 'TangyFormResponse',
  //     form: {id: TEST_FORM_ID_1},
  //     items: [],
  //     complete: true
  //   })
  //   // This syncs because it belongs to a FormInfo configured to couchdb sync but ignore the location query.
  //   await mockRemoteDb.put({
  //     _id:"doc2",
  //     location: LOCATION_2,
  //     collection: 'TangyFormResponse',
  //     form: {id: TEST_FORM_ID_2},
  //     items: [],
  //     complete: true
  //   })
  //   // This WILL NOT sync because it belongs to a FormInfo configured to filterByID and the location DOES NOT match the mock query.
  //   await mockRemoteDb.put({
  //     _id:"doc3",
  //     location: LOCATION_2,
  //     collection: 'TangyFormResponse',
  //     form: {id: TEST_FORM_ID_1},
  //     items: [],
  //     complete: true
  //   })
  //   // This WILL NOT sync because it belongs to a FormInfo that does not have couchdb sync enabled.
  //   await mockRemoteDb.put({
  //     _id:"doc4",
  //     location: LOCATION_1,
  //     collection: 'TangyFormResponse',
  //     form: {id: TEST_FORM_ID_3},
  //     items: [],
  //     complete: true
  //   })
  //   // Sync.
  //   syncCouchdbService.sync(userDb, <SyncCouchdbDetails>{
  //     serverUrl: MOCK_SERVER_URL,
  //     groupId: MOCK_GROUP_ID,
  //     deviceId: MOCK_DEVICE_ID,
  //     deviceToken: MOCK_DEVICE_TOKEN,
  //     formInfos: FORM_INFOS,
  //     locationQueries: [MOCK_LOCATION_QUERY]
  //   }).then(async status => {
  //     expect(status.pulled).toBe(2)
  //     const doc1 = await userDb.get('doc1')
  //     expect(doc1).toBeTruthy()
  //     const doc2 = await userDb.get('doc2')
  //     expect(doc2).toBeTruthy()
  //     try {
  //       const doc3 = await userDb.get('doc3')
  //       expect(doc3).toBeFalsy()
  //     } catch (e) {
  //       // All good.
  //     }
  //     try {
  //       const doc4 = await userDb.get('doc4')
  //       expect(doc4).toBeFalsy()
  //     } catch (e) {
  //       // All good.
  //     }
  //     done()
  //   })
  //   setTimeout(() => {
  //     const req = httpTestingController.expectOne(`${MOCK_SERVER_URL}sync-session/start/${MOCK_GROUP_ID}/${MOCK_DEVICE_ID}/${MOCK_DEVICE_TOKEN}`);
  //     expect(req.request.method).toEqual('GET')
  //     req.flush(MOCK_REMOTE_DB_CONNECT_STRING);
  //   }, 500)
  // }, 4000)

  // it('should not count remotely created docs synced down as needing sync (missing .tangerineSyncedOn, no need some kind of flag for neverSynced that client can use. This just affects the count of how many docs need syncing, wouldnt actually cause a sync.)...')
  // it('should push everything because maybe we changed location of device and there is some info tied to the old location? Or maybe changing location is a database clear kind of thing.')
});

