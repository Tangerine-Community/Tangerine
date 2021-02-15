import { VariableService } from './../../shared/_services/variable.service';
import { LockBoxService } from './../../shared/_services/lock-box.service';
import { Loc } from 'tangy-form/util/loc.js';
import { Device } from './../classes/device.class';
import { AppConfigService } from './../../shared/_services/app-config.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {AppConfig} from '../../shared/_classes/app-config.class';
const bcrypt = window['dcodeIO'].bcrypt

export interface AppInfo {
  serverUrl:string
  groupName:string
  groupId:string
  buildChannel:string
  tangerineVersion:string
  buildId:string
  assignedLocation:string
  versionTag:string
}

@Injectable({
  providedIn: 'root'
})
export class DeviceService {

  username:string
  password:string
  rawBuildChannel:string
  buildId:string
  tangerineVersion:string
  versionTag:string

  constructor(
    private httpClient:HttpClient,
    private variableService:VariableService,
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

  async register(id, token, isTest = false):Promise<Device> {
    const appConfig = await this.appConfigService.getAppConfig()
    let device:Device
    if (isTest) {
      // Pick a location out of the location list.
      const locationList = await this.appConfigService.getLocationList()
      const flatLocationList = Loc.flatten(locationList)
      const pickedLocation = [...flatLocationList.locationsLevels]
        // Pick any first node at the bottom of the tree, work our way up into an array of location nodes.
        .reverse()
        .reduce((locationArray, level, i) => {
          return [
            i === 0
              ? flatLocationList.locations.find(node => node.level === level)
              : flatLocationList.locations.find(node => node.id === locationArray[0].parent),
            ...locationArray
          ]
        }, [])    
        // Transform the array of location nodes into a location object where the keys are the level and the values are the node IDs.
        .reduce((location, node) => {
          return {
            ...location,
            [node.level]: node.id
          }
        }, {})
      // @TODO Assign a location.
      device = <Device>{
        _id: id,
        token,
        key: 'test',
        assignedLocation: pickedLocation,
        syncLocations: [pickedLocation]
      }
    } else {
      device = <Device>await this
        .httpClient
        .get(`${appConfig.serverUrl}group-device-public/register/${appConfig.groupId}/${id}/${token}`).toPromise()
    }
    await this.variableService.set('tangerine-device-is-registered', true)
    return device
  }

  async isRegistered() {
    return await this.variableService.get('tangerine-device-is-registered')
  }

  async getDevice():Promise<Device> {
    try {
      const locker = this.lockBoxService.getOpenLockBox()
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

  async didSync(status):Promise<any> {
    const appConfig = await this.appConfigService.getAppConfig()
    const device = await this.getDevice()
    const version = await this.getBuildId()
    if (status) {
      console.log("Sending sync status.")
      await this
        .httpClient
        .post(`${appConfig.serverUrl}group-device-public/did-sync-status/${appConfig.groupId}/${device._id}/${device.token}/${version}`, {
            status: status
          }).toPromise()
    } else {
      await this
        .httpClient
        .get(`${appConfig.serverUrl}group-device-public/did-sync/${appConfig.groupId}/${device._id}/${device.token}/${version}`).toPromise()
    }
    
  }

  async didSyncError(error):Promise<any> {
    const appConfig = await this.appConfigService.getAppConfig()
    const device = await this.getDevice()
    const version = await this.getBuildId()
    await this
      .httpClient
      .get(`${appConfig.serverUrl}group-device-public/did-sync-error/${appConfig.groupId}/${device._id}/${device.token}/${version}/${error}`).toPromise()
  }

  async getAppInfo() {
    const appConfig = await this.appConfigService.getAppConfig()
    const buildId = await this.getBuildId()
    const buildChannel = await this.getBuildChannel()
    const device = await this.getDevice()
    const locationList = await this.appConfigService.getLocationList();
    const flatLocationList = Loc.flatten(locationList)
    const assignedLocation = device && device.assignedLocation && device.assignedLocation.value && Array.isArray(device.assignedLocation.value)
      ? device.assignedLocation.value.map(value => ` ${value.level}: ${flatLocationList.locations.find(node => node.id === value.value).label}`).join(', ')
      : 'N/A'
    const tangerineVersion = await this.getTangerineVersion()
    const versionTag = await this.getVersionTag()
    return <AppInfo>{
      serverUrl: appConfig.serverUrl,
      groupName: appConfig.groupName,
      groupId: appConfig.groupId,
      tangerineVersion,
      buildChannel,
      buildId,
      deviceId: device._id,
      assignedLocation,
      versionTag
    }
  }

  async getTangerineVersion() {
    try {
      this.tangerineVersion = this.tangerineVersion ? this.tangerineVersion : await this.httpClient.get('./assets/tangerine-version', {responseType: 'text'}).toPromise();
      return this.tangerineVersion.replace(/\n$/, '');
    } catch (e) {
      return 'N/A';
    }
  }

  async getBuildId() {
    try {
      this.buildId = this.buildId ? this.buildId : await this.httpClient.get('./assets/tangerine-build-id', {responseType: 'text'}).toPromise();
      return this.buildId.replace(/\n$/, '');
    } catch (e) {
      return 'N/A';
    }
  }

  async getBuildChannel() {
    try {
      this.rawBuildChannel = this.rawBuildChannel ? this.rawBuildChannel : await this.httpClient.get('./assets/tangerine-build-channel', {responseType: 'text'}).toPromise()
      return this.rawBuildChannel.includes('prod')
        ? 'live'
        : this.rawBuildChannel.includes('qa')
          ? 'test'
          : 'unknown'
    } catch (e) {
      return 'N/A'
    }
  }

  async getVersionTag() {
    try {
      this.versionTag = this.versionTag ? this.versionTag : await this.httpClient.get('./assets/tangerine-version-tag', {responseType: 'text'}).toPromise()
      return this.versionTag.replace(/\n$/, '');
    } catch (e) {
      return 'N/A'
    }
  }

}
