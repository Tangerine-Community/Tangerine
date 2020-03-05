import { VariableService } from './../../shared/_services/variable.service';
import { LockBoxService } from './../../shared/_services/lock-box.service';
import { UserService } from 'src/app/shared/_services/user.service';
import { Loc } from 'tangy-form/util/loc.js';
import { Device } from './../classes/device.class';
import { AppConfigService } from './../../shared/_services/app-config.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
const bcrypt = window['dcodeIO'].bcrypt 

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

  username:string
  password:string

  constructor(
    private httpClient:HttpClient,
    private variableService:VariableService,
    private userService:UserService,
    private lockBoxService:LockBoxService,
    private appConfigService:AppConfigService
  ) { 
  }

  async install() {
    // ?
  }

  async getRemoteDeviceInfo(id, token):Promise<Device> {
    const appConfig = await this.appConfigService.getAppConfig()
    const device = <Device>await this
      .httpClient
      .get(`${appConfig.serverUrl}group-device-public/read/${appConfig.groupId}/${id}/${token}`).toPromise() 
    return device
  }

  async register(id, token):Promise<Device> {
    const appConfig = await this.appConfigService.getAppConfig()
    const device = <Device>await this
      .httpClient
      .get(`${appConfig.serverUrl}group-device-public/register/${appConfig.groupId}/${id}/${token}`).toPromise() 
    
    await this.variableService.set('tangerine-device-is-registered', true)
    await this.userService.installSharedUserDatabase(device)
    return device
  }

  async isRegistered() {
    return await this.variableService.get('tangerine-device-is-registered')
  }

  async getDevice():Promise<Device> {
    try {
      const locker = this.lockBoxService.getOpenLockBox(this.userService.getCurrentUser())
      return locker.contents.device
    } catch (e) {
      return new Device()
    }
  }

  async didUpdate(deviceId = '', deviceToken = ''):Promise<any> {
    const appConfig = await this.appConfigService.getAppConfig()
    const version = await this.getBuildId()
    if (!deviceId || !deviceToken) {
      const device = await this.getDevice()
      deviceId = device._id
      deviceToken = device.token
    }
    await this
      .httpClient
      .get(`${appConfig.serverUrl}group-device-public/did-update/${appConfig.groupId}/${deviceId}/${deviceToken}/${version}`).toPromise() 
  }

  async didSync():Promise<any> {
    const appConfig = await this.appConfigService.getAppConfig()
    const device = await this.getDevice()
    const version = await this.getBuildId()
    await this
      .httpClient
      .get(`${appConfig.serverUrl}group-device-public/did-sync/${appConfig.groupId}/${device._id}/${device.token}/${version}`).toPromise() 
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

  passwordIsSet():boolean {
    return localStorage.getItem('tangerine-device-password') ? true : false
  }

}
