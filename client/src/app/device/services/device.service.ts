import { AboutService } from './../../core/about/about.service';
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
    private aboutService:AboutService,
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
    await this.didUpdate()
    return device
  }
  
  async isRegistered() {
    const device = await this.getDevice()
    return device._id === 'N/A' ? false : true
  }

  async getDevice():Promise<Device> {
    try {
      const deviceDoc = <TangerineDeviceDoc>await this.db.get(TANGERINE_DEVICE_DOC)
      return deviceDoc.device ? deviceDoc.device : <Device>{_id: 'N/A'}
    } catch (e) {
      return new Device()
    }
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

  async didUpdate():Promise<any> {
    const appConfig = await this.appConfigService.getAppConfig()
    const tangerineDeviceDoc = <TangerineDeviceDoc>await this.db.get(TANGERINE_DEVICE_DOC)
    const version = await this.aboutService.getBuildNumber()
    const device = <Device>await this
      .http
      .get(`${appConfig.serverUrl}group-device/did-update/${appConfig.groupId}/${tangerineDeviceDoc.device._id}/${tangerineDeviceDoc.device.token}/${version}`).toPromise() 
  }

  async didSync():Promise<any> {
    const appConfig = await this.appConfigService.getAppConfig()
    const tangerineDeviceDoc = <TangerineDeviceDoc>await this.db.get(TANGERINE_DEVICE_DOC)
    const version = await this.aboutService.getBuildNumber()
    const device = <Device>await this
      .http
      .get(`${appConfig.serverUrl}group-device/did-sync/${appConfig.groupId}/${tangerineDeviceDoc.device._id}/${tangerineDeviceDoc.device.token}/${version}`).toPromise() 
  }
}
