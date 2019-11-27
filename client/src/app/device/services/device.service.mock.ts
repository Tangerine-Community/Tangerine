import { Device, LocationConfig, LocationSelection } from './../classes/device.class';
import { PouchDB } from 'pouchdb';
import { AppConfigService } from './../../shared/_services/app-config.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const TANGERINE_DEVICE_STORE = 'TANGERINE_DEVICE_STORE'
const TANGERINE_DEVICE_DOC = 'TANGERINE_DEVICE_DOC'

class TangerineDeviceDoc {
  _id = TANGERINE_DEVICE_DOC
  device:Device
}

const LOCATION_LEVEL_1 = 'county'
const LOCATION_LEVEL_2 = 'city'
const LOCATION_1 = {
  [LOCATION_LEVEL_1]: 'county1',
  [LOCATION_LEVEL_2]: 'city1'
}
const LOCATION_2 = {
  [LOCATION_LEVEL_1]: 'county2',
  [LOCATION_LEVEL_2]: 'city2'
}

const MOCK_GROUP_ID = 'MOCK_GROUP_ID'
const MOCK_DEVICE_ID = 'MOCK_DEVICE_ID'
const MOCK_DEVICE_TOKEN = 'MOCK_DEVICE_TOKEN'
const MOCK_SERVER_URL = 'MOCK_SERVER_URL'

const MOCK_REMOTE_DB_CONNECT_STRING = 'MOCK_REMOTE_DB_CONNECT_STRING' 

const MOCK_DEVICE = <Device>{
  _id: MOCK_DEVICE_ID,
  token: MOCK_DEVICE_TOKEN,
  syncLocations:[
    <LocationConfig>{
      showLevels: [ LOCATION_LEVEL_1 ],
      value: [ 
        <LocationSelection>{
          level: LOCATION_LEVEL_1,
          value: LOCATION_1[LOCATION_LEVEL_1]
        }
      ]
    }
  ]
}

export class MockDeviceService {

  db = new PouchDB(TANGERINE_DEVICE_STORE)

  async install() {
  }

  async uninstall() {
  }

  async register(token):Promise<Device> {
    return MOCK_DEVICE
  }

  async getDevice():Promise<Device> {
    return MOCK_DEVICE
  }

  async updateDevice():Promise<Device> {
    return MOCK_DEVICE
  }

}
