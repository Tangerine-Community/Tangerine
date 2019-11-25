import { Device } from './../classes/device.class';
import PouchDB from 'pouchdb';
import { AppConfigService } from './../../shared/_services/app-config.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

const TANGERINE_DEVICE_STORE = 'TANGERINE_DEVICE_STORE'
const TANGERINE_DEVICE_DOC = 'TANGERINE_DEVICE_DOC'

class TangerineDeviceDoc {
  _id = TANGERINE_DEVICE_DOC
  device:Device
}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  db:PouchDB 

  constructor(
    private http:HttpClient,
    private appConfigService:AppConfigService
  ) { 
    this.db = new PouchDB(TANGERINE_DEVICE_STORE)
  }

  async install() {
    await this.db.put({
      _id: TANGERINE_DEVICE_DOC
    })
  }

  async uninstall() {
    await this.db.destroy()
  }

  async register(id, token):Promise<Device> {
    const appConfig = await this.appConfigService.getAppConfig()
    const tangerineDeviceDoc = <TangerineDeviceDoc>await this.db.get(TANGERINE_DEVICE_DOC)
    const device = <Device>await this
      .http
      .get(`${appConfig.serverUrl}group-device/register/${appConfig.groupId}/${id}/${token}`).toPromise() 
    await this.db.put({
      ...tangerineDeviceDoc,
      device
    })
    return device
  }

  async getDevice():Promise<Device> {
    const deviceDoc = <TangerineDeviceDoc>await this.db.get(TANGERINE_DEVICE_DOC)
    return deviceDoc.device ? deviceDoc.device : <Device>{_id: 'N/A'}
  }

  async updateDevice():Promise<Device> {
    const appConfig = await this.appConfigService.getAppConfig()
    const tangerineDeviceDoc = <TangerineDeviceDoc>await this.db.get(TANGERINE_DEVICE_DOC)
    const device = <Device>await this
      .http
      .get(`${appConfig.serverUrl}group-device/info/${appConfig.groupId}/${tangerineDeviceDoc.device._id}/${tangerineDeviceDoc.device.token}`).toPromise() 
    await this.db.put({
      ...tangerineDeviceDoc,
      device
    })
    return device
  }


}
