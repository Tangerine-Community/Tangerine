import { VariableService } from './../../shared/_services/variable.service';
import { LockerService } from './../../shared/_services/locker.service';
import { AuthenticationService } from './../../shared/_services/authentication.service';
import { UserService } from 'src/app/shared/_services/user.service';
import { Loc } from 'tangy-form/util/loc.js';
import { Device } from './../classes/device.class';
import PouchDB from 'pouchdb';
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
    private lockerService:LockerService,
    private appConfigService:AppConfigService
  ) { 
  }

  async install() {
    // ?
  }


  async register(id, token):Promise<Device> {
    const appConfig = await this.appConfigService.getAppConfig()
    const device = <Device>await this
      .httpClient
      .get(`${appConfig.serverUrl}group-device/register/${appConfig.groupId}/${id}/${token}`).toPromise() 
    
    await this.variableService.set('tangerine-device-is-registered', true)
    await this.didUpdate()
    return device
  }

  async isRegistered() {
    return await this.variableService.get('tangerine-device-is-registered')
  }

  async getDevice():Promise<Device> {
    try {
      const locker = this.lockerService.getOpenLocker(this.userService.getCurrentUser())
      return locker.contents.device
    } catch (e) {
      return new Device()
    }
  }

  async didUpdate():Promise<any> {
    const appConfig = await this.appConfigService.getAppConfig()
    const device = await this.getDevice()
    const version = await this.getBuildId()
    await this
      .httpClient
      .get(`${appConfig.serverUrl}group-device/did-update/${appConfig.groupId}/${device._id}/${device.token}/${version}`).toPromise() 
  }

  async didSync():Promise<any> {
    const appConfig = await this.appConfigService.getAppConfig()
    const device = await this.getDevice()
    const version = await this.getBuildId()
    await this
      .httpClient
      .get(`${appConfig.serverUrl}group-device/did-sync/${appConfig.groupId}/${device._id}/${device.token}/${version}`).toPromise() 
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
