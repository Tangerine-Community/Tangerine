import { Loc } from 'tangy-form/util/loc.js';
import { Device } from './../classes/device.class';
import PouchDB from 'pouchdb';
import { AppConfigService } from './../../shared/_services/app-config.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
const bcrypt = window['dcodeIO'].bcrypt 

const TANGERINE_DEVICE_STORE = 'TANGERINE_DEVICE_STORE'
const TANGERINE_DEVICE_DOC = 'TANGERINE_DEVICE_DOC'

class TangerineDeviceDoc {
  _id = TANGERINE_DEVICE_DOC
  device:Device
}

export interface AppInfo {
  serverUrl:string
  groupName:string
  groupId:string
  buildChannel:string
  buildId:string
  assignedLocation:string
}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  db:PouchDB 

  constructor(
    private httpClient:HttpClient,
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
      .httpClient
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
      .httpClient
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
    const version = await this.getBuildId()
    const device = <Device>await this
      .httpClient
      .get(`${appConfig.serverUrl}group-device/did-update/${appConfig.groupId}/${tangerineDeviceDoc.device._id}/${tangerineDeviceDoc.device.token}/${version}`).toPromise() 
  }

  async didSync():Promise<any> {
    const appConfig = await this.appConfigService.getAppConfig()
    const tangerineDeviceDoc = <TangerineDeviceDoc>await this.db.get(TANGERINE_DEVICE_DOC)
    const version = await this.getBuildId()
    const device = <Device>await this
      .httpClient
      .get(`${appConfig.serverUrl}group-device/did-sync/${appConfig.groupId}/${tangerineDeviceDoc.device._id}/${tangerineDeviceDoc.device.token}/${version}`).toPromise() 
  }

  async getAppInfo() {
    const appConfig = await this.appConfigService.getAppConfig()
    const buildId = await this.getBuildId()
    const buildChannel = await this.getBuildChannel()
    const device = await this.getDevice()
    const locationList = await this.httpClient.get('./assets/location-list.json').toPromise()
    const flatLocationList = Loc.flatten(locationList)
    const assignedLocation = device && device.assignedLocation && device.assignedLocation.value && Array.isArray(device.assignedLocation.value)
      ? device.assignedLocation.value.map(value => ` ${value.level}: ${flatLocationList.locations.find(node => node.id === value.value).label}`).join(', ')
      : 'N/A'
    return <AppInfo>{
      serverUrl: appConfig.serverUrl,
      groupName: appConfig.groupName,
      groupId: appConfig.groupId,
      buildChannel,
      buildId,
      deviceId: device._id,
      assignedLocation
    }
  }

  async getBuildId() {
    try {
      return await this.httpClient.get('./assets/tangerine-build-id', {responseType: 'text'}).toPromise()
    } catch (e) {
      return 'N/A'
    }
  }

  async getBuildChannel() {
    try {
      const raw = await this.httpClient.get('./assets/tangerine-build-channel', {responseType: 'text'}).toPromise()
      return raw.includes('prod')
        ? 'live'
        : raw.includes('qa')
          ? 'test'
          : 'unknown'
    } catch (e) {
      return 'N/A'
    }
  }

  setPassword(password:string) {
    const salt = bcrypt.genSaltSync(10);
    localStorage.setItem('tangerine-device-password', bcrypt.hashSync(password, salt))
  }

  verifyPassword(password:string) {
    return bcrypt.compareSync(password, localStorage.getItem('tangerine-device-password')) 
  }

}
