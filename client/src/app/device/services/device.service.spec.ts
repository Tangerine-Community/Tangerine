import { AppConfig } from 'src/app/shared/_classes/app-config.class';
import { AppConfigService } from './../../shared/_services/app-config.service';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DeviceService } from './device.service';
import { Device } from '../classes/device.class';

const MOCK_GROUP_ID = 'MOCK_GROUP_ID'
const MOCK_DEVICE_ID = 'MOCK_DEVICE_ID'
const MOCK_DEVICE_TOKEN_1 = 'MOCK_DEVICE_TOKEN_1'
const MOCK_DEVICE_TOKEN_2 = 'MOCK_DEVICE_TOKEN_2'
const MOCK_SERVER_URL = 'MOCK_SERVER_URL'

/* @TODO
const MOCK_DEVICE = <Device>{
  _id: MOCK_DEVICE_ID,
  token: MOCK_DEVICE_TOKEN_2,
  location: {},
  claimed: true,
  syncLocations: []
}

const MOCK_APP_CONFIG = <AppConfig>{
  serverUrl: MOCK_SERVER_URL,
  groupName: MOCK_GROUP_ID,
  groupId: MOCK_GROUP_ID,
  sharedUserDatabase: false
}

class MockAppConfigService {
  getAppConfig():Promise<AppConfig> {
    return new Promise((resolve, reject) => {
      resolve(MOCK_APP_CONFIG)
    })
  }
}

describe('DeviceService', () => {

  let httpTestingController: HttpTestingController
  let deviceService: DeviceService

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [ 
        {provide: AppConfigService, useClass: MockAppConfigService},
        DeviceService
      ],
      imports: [
        HttpClientTestingModule
      ]
    })
    deviceService = TestBed.get(DeviceService)
    httpTestingController = TestBed.get(HttpTestingController)
    deviceService.install()
  });

  afterEach(async() => {
    await deviceService.uninstall()
  })

  it('should be created', () => {
    const service: DeviceService = TestBed.get(DeviceService);
    expect(service).toBeTruthy();
  });

  it('should register, get device info, and then get updated device info', async(done) => {
    deviceService.register(MOCK_DEVICE_ID, MOCK_DEVICE_TOKEN_1).then(async responseDevice => {
      const device = await deviceService.getDevice()
      expect(device._id).toEqual(responseDevice._id)
      expect(device.token).toEqual(MOCK_DEVICE_TOKEN_2)
      expect(device._id).toEqual(MOCK_DEVICE_ID)
      deviceService.updateDevice().then(async responseDevice => {
        const device = await deviceService.getDevice()
        expect(device._id).toEqual(responseDevice._id)
        expect(device.location.city).toEqual('portland')
        done()
      })
      setTimeout(() => {
        const req = httpTestingController.expectOne(`${MOCK_SERVER_URL}api/device/info/${MOCK_GROUP_ID}/${MOCK_DEVICE_ID}/${MOCK_DEVICE_TOKEN_2}`);
        expect(req.request.method).toEqual('GET')
        req.flush({
          ...MOCK_DEVICE,
          location: {
            'city': 'portland',
            'state': 'oregon'
          }
        });
      }, 500)
    })
    setTimeout(() => {
      const req = httpTestingController.expectOne(`${MOCK_SERVER_URL}api/device/register/${MOCK_GROUP_ID}/${MOCK_DEVICE_ID}/${MOCK_DEVICE_TOKEN_1}`);
      expect(req.request.method).toEqual('GET')
      req.flush(MOCK_DEVICE);
    }, 500)
  }, 3000)

});
*/