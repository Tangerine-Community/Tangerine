import { TestBed } from '@angular/core/testing';

import PouchDB from 'pouchdb';

import { AppConfig } from 'src/app/shared/_classes/app-config.class';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { UserService } from 'src/app/shared/_services/user.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { TangyFormsModule } from 'src/app/tangy-forms/tangy-forms.module';
import { AppConfigService } from 'src/app/shared/_services/app-config.service';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { SyncingService } from 'src/app/core/sync-records/_services/syncing.service';
import { TangyFormService } from 'src/app/tangy-forms/tangy-form-service';

const formResponse = {
  "_id": "a5662594-f5e3-471e-9cca-3e27e781ac0f",
  "collection": "TangyFormResponse",
  "form": {
    "fullscreen": false,
    "title": "Field Demo",
    "complete": false,
    "linearMode": true,
    "hideClosedItems": true,
    "hideCompleteFab": false,
    "tabIndex": 0,
    "showResponse": false,
    "showSummary": false,
    "hasSummary": true,
    "onSubmit": "\n          console.log('tangy-form.on-submit called')\n        ",
    "id": "field-demo",
    "tagName": "TANGY-FORM"
  },
  "items": [
    {
      "id": "gps_item",
      "title": "GPS and Location",
      "summary": false,
      "fullscreen": false,
      "hideButtons": true,
      "hideBackButton": true,
      "rightToLeft": false,
      "hideNextButton": false,
      "showCompleteButton": false,
      "inputs": [
        {
          "name": "gps-coords",
          "value": {
            "latitude": 44.4513617,
            "longitude": -73.2048831,
            "accuracy": 1516
          },
          "hintText": "",
          "required": false,
          "hideAccuracyDistance": false,
          "hideAccuracyLevel": false,
          "hideCoordinates": false,
          "disabled": false,
          "invalid": false,
          "inGeofence": false,
          "tagName": "TANGY-GPS"
        },
        {
          "name": "location",
          "hintText": "",
          "value": [
            {
              "level": "county",
              "value": "county1"
            },
            {
              "level": "school",
              "value": "school1"
            }
          ],
          "required": false,
          "invalid": false,
          "showMetaData": false,
          "locationSrc": "./assets/location-list.json",
          "showLevels": "county,school",
          "hidden": false,
          "disabled": false,
          "filterBy": "",
          "filterByGlobal": false,
          "tagName": "TANGY-LOCATION"
        }
      ],
      "open": false,
      "incomplete": false,
      "disabled": false,
      "hidden": true,
      "locked": false,
      "isDirty": false,
      "tagName": "TANGY-FORM-ITEM"
    },
    {
      "id": "checkboxes_item",
      "title": "Checkboxes",
      "summary": false,
      "fullscreen": false,
      "hideButtons": true,
      "hideBackButton": false,
      "rightToLeft": false,
      "hideNextButton": false,
      "showCompleteButton": false,
      "inputs": [],
      "open": true,
      "incomplete": true,
      "disabled": false,
      "hidden": false,
      "locked": false,
      "isDirty": false,
      "tagName": "TANGY-FORM-ITEM"
    }
  ],
  "complete": false,
  "focusIndex": 1,
  "nextFocusIndex": 2,
  "previousFocusIndex": 0,
  "startDatetime": "4/26/2019, 10:04:00 AM",
  "startUnixtime": 1556287440186,
  "uploadDatetime": "",
  "nextItemId": "text_inputs_item",
  "previousItemId": "gps_item",
  "progress": 0
}

const MOCK_REMOTE_DOC_IDS = [
  'doc1',
  'doc2'
]

const MOCK_LOCAL_DB_INFO_1 = 'MOCK_LOCAL_DB_INFO_1'
const MOCK_SERVER_URL = 'http://localhost/'

class MockTangyFormService {
  async getFormsInfo() {
    return [
      {id: 'example1', src: './example1/form.json', title: 'Example 1'},
      {id: 'example2', src: './example2/form.json', title: 'Example 2'},
    ]
  }
}

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

describe('TwoWaySyncService', () => {

  let httpClient: HttpClient
  let httpTestingController: HttpTestingController
  let userService: UserService
  let tangyFormService: TangyFormService  

  beforeEach(async() => { 
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        SharedModule
      ],
      providers: [
        {provide: AppConfigService, useClass: MockAppConfigService}
      ]
    })
    // Get fresh injected instances.
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    userService = TestBed.get(UserService);
    tangyFormService = TestBed.get(TangyFormService)
  })

  it('should be created', () => {
    const service: TangyFormService = TestBed.get(TangyFormService);
    expect(service).toBeTruthy();
  });

  it('should save', async function(done) {
    const userAccount = await userService.create({
      username: MOCK_LOCAL_DB_INFO_1,
      securityQuestionResponse: '123',
      password: '123'
    })
    const tangyFormService = new TangyFormService({ databaseName: userAccount._id });
    await tangyFormService.saveResponse(formResponse)
  })
});
